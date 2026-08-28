# Philosophy — a 1000-card running order

The plan for `phil`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the thirteenth of these and the second that is not a history collection, after Psychology. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `ph-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='ph-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `ph-001` … `ph-999`, then `ph-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`ph-148 The theory of Forms` is already an answer term; `ph-340 Whether "philosophy" is the right word
for these traditions` is an argument to describe, and the card's actual answer — the word that gets
blanked — is chosen while writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** When that happens,
change the line here in the same commit as the card, and say so — this file is only useful while it is
true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file, as they did for Egypt, the Second World War,
Japan and Psychology.

**The id is `phil`**, following the readable-id precedent, and **the card prefix is `ph-`**, free of
every existing prefix (`wh-`, `gr-`, `rm-`, `us-`, `ru-`, `in-`, `cnh-`, `eg-`, `ww2-`, `jp-`, `ps-`,
`geo-`) and no prefix of any of them — note in particular that it is distinct from Psychology's `ps-`,
which is the one pair on the shelf a typo could confuse.

**The hue is `#14545A`, a dark petrol**, and the sweep that chose it is worth recording because it
overturns a claim already written into `app.js`. Measured in CIELAB against all nineteen hues now on
the shelf, inside the shelf's own band, the two best-separated regions are **an olive-brass at 27.8**
and **a hot magenta at 29.4**, and both were rejected on register: the brass would be the fourth thing
in a yellow-green-brown quarter that already holds World History's sepia, Geography's olive and the
German deck's brown, and the magenta sits at chroma 62 on a shelf that is muted throughout — the same
two rejections the Psychology plan made a day earlier, for the same reasons, which is why the plum it
took is no longer available here.

**What that leaves is the one family the shelf does not have at all.** There is no teal on Folio:
Egypt's malachite is a sea green at hue 173 and Greece's Aegean is a blue at 247, and the whole band
between them is empty. `#14545A` sits there at **19.8 from BOTH of them**, equidistant rather than
leaning at one, with L\* 32 and chroma 20 and a contrast of 8.6:1 against white.

**19.8 is below the shelf's median and that is a deliberate trade, stated rather than buried.** The
nineteen existing hues have a median nearest-neighbour distance of 23.9, so this is not the best-separated
colour available. It is well clear of the bar the house has actually used — **the tightest existing pair
is 12.9**, China's vermilion against Russia's lacquer — and it beats five pairs already shipped
(12.9 twice, 17.4, 17.5, 19.9 twice). Against that, it is the only candidate that adds a *family* rather
than a fourth member of one, and a dark petrol is a sober, scholarly colour where the alternatives were
an acid olive and an orchid.

**It also refines the claim in `COLL_THEME`'s Geography comment**, which says "the whole teal band is
unusable: every candidate lands 5–11 of Egypt's malachite or Greece's Aegean blue". That is true at
*mid* lightness — at L\* 38 the best teal is 17.2 and it falls away above that — and false at the dark
end, where L\* 32 buys 19.8. The band is not unusable; the top half of it is.

**It gets a `COLLECTION_ICON` row and a new symbol, `owl`** — the owl of Minerva, which is the emblem
philosophy has actually used since antiquity, and which nothing on Folio is already wearing (the site's
own mark is a vermilion seal, so an owl cannot be read as Folio's brand). Two candidates were rejected
first. **A lamp** would collide with the picker's existing `flame`, and **a marble bust** would put a
second head on a shelf that has just gained one for Psychology, which is exactly the two-collections-one-
mark problem the compass rose was drawn to avoid for Geography.

**It goes in the `Philosophy` section of the Collections page**, added to `COLLECTION_SECTIONS` beside
History, Geography and the `Science` row that shipped with Psychology. Like that one it draws NOTHING
until the collection has a card, because `PAGES.decks` skips a section with no available collections.
**The heading and the collection share a name, which is the one place this shelf reads oddly**, and the
alternatives were worse: `sectionOf` files anything unnamed under History, and a Philosophy collection
under a History heading is a claim about the subject rather than a gap. The echo resolves itself the day
a second collection in this section arrives — an Ancient Philosophy or an Ethics — which is the same
argument that made Geography a heading rather than a collection.

## What this collection is about, and the five scope decisions

**It is philosophy as a subject, taught the way a good department teaches it: historically and
systematically at once.** Six of the nine decks run in chronological order from the Presocratics to
post-structuralism; the last two are organised by problem instead — metaphysics, epistemology, mind,
science, ethics, politics, aesthetics — because that is how the questions are actually argued now, and a
reader who only met them in historical order would know who said what and not what turns on it.

**First: this is not a Western philosophy collection, and the structure has to carry that rather than
say it.** Indian, Buddhist, Chinese and Japanese philosophy get **deck 3 and 115 cards**, placed third —
in chronological position beside Greece and before the medievals — rather than appended at the end,
because an appendix is what "and also the rest of the world" looks like on a page. Philosophy in the
Islamic world gets 30 cards inside deck 4, where it belongs both chronologically and intellectually: it
is the tradition that preserved and transformed Aristotle, and it is not a footnote to the Latin
scholastics who read it. Africana, decolonial and Latin American philosophy sit in **`ph-critical`**,
with critical theory and feminist philosophy — not as a diversity bucket but because those five are one
lineage of critique, and Du Bois, Fanon, Dussel and Butler are argued about in the same rooms.

**`ph-340` cards the question this decision raises**, rather than settling it silently: whether
"philosophy" is the right word for traditions that did not use it, which is a live argument with serious
people on both sides and is more useful to a reader than either answer asserted flat.

**Second: a card gives the ARGUMENT, not the position.** This is the collection's central rule and the
one that makes it hard to write. "Hume thought causation was constant conjunction" is a fact about Hume;
what a reader needs is *why anyone would think that* — what the argument is, what it rules out, and what
the strongest objection to it is. A card that lists positions teaches a reader to name views they cannot
evaluate, which is the failure mode of every bad philosophy course. **Ten sentences is enough for a
premise, a conclusion and an objection**, and that is what most cards should contain.

**Third: a live philosophical question is presented as live.** Where the field is genuinely divided —
free will, moral realism, the hard problem, the analytic–synthetic distinction, personal identity — the
card says so, gives the main positions with their strongest arguments, and does not adjudicate. Folio is
not a party to these disputes. **The distinction to hold onto** is the one the history plans already
draw: a question being *contested among philosophers* is not the same as its being *unsettled in
fact*, and the collection may say plainly that an argument is widely regarded as unsound (the ontological
argument in Anselm's form, verificationism, the naturalistic fallacy as usually deployed) where that is
the scholarly consensus rather than a preference.

**Fourth: religion is carded as philosophy, not as belief.** Arguments for and against the existence of
God, the problem of evil, faith and reason, negative theology and divine command are all here — as
arguments, assessed as arguments — and the collection takes no view on whether any religion is true.
This matters most in decks 3 and 4, which are largely written by people for whom the theology was the
point; the card describes what they argued and why, and never adopts the frame in which the conclusion
is already granted.

**Fifth: the primary text is the source wherever one exists, and the scholarship is what tells you how
to read it.** Philosophy is unusual among Folio's subjects in that most of its evidence is *published and
out of copyright*: the Republic, the Nicomachean Ethics, the Meditations, the Treatise, the first
Critique, the Tractatus. A card on the cogito should rest on Meditation II and on a piece of scholarship
about it, not on a summary of a summary. **Nine of these texts are already on Folio's own shelf** — see
"Living beside the other collections" below.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Foundations, Method and Logic | What philosophy is | 20 | ph-001–020 |
|  | Argument, reasoning and fallacies | 25 | ph-021–045 |
|  | Formal logic | 30 | ph-046–075 |
|  | Philosophy of logic and mathematics | 25 | ph-076–100 |
| Ancient Mediterranean Philosophy | The Presocratics | 25 | ph-101–125 |
|  | Socrates and the sophists | 20 | ph-126–145 |
|  | Plato | 30 | ph-146–175 |
|  | Aristotle | 30 | ph-176–205 |
|  | Hellenistic and Roman philosophy | 20 | ph-206–225 |
| Indian, Chinese and Japanese Philosophy | Classical Indian philosophy | 30 | ph-226–255 |
|  | Buddhist philosophy | 30 | ph-256–285 |
|  | Chinese philosophy | 35 | ph-286–320 |
|  | Japanese and modern Asian philosophy | 20 | ph-321–340 |
| Medieval, Islamic and Jewish Philosophy | Late antiquity and Augustine | 20 | ph-341–360 |
|  | Philosophy in the Islamic world | 30 | ph-361–390 |
|  | Jewish philosophy | 15 | ph-391–405 |
|  | Scholasticism | 30 | ph-406–435 |
| Early Modern Philosophy | Renaissance and the scientific revolution | 25 | ph-436–460 |
|  | The rationalists | 30 | ph-461–490 |
|  | The empiricists | 30 | ph-491–520 |
|  | Kant | 30 | ph-521–550 |
| The Nineteenth Century and Continental Philosophy | German idealism and its critics | 25 | ph-551–575 |
|  | Marx, Kierkegaard and Nietzsche | 25 | ph-576–600 |
|  | Phenomenology and existentialism | 30 | ph-601–630 |
|  | Critical theory, feminist and decolonial philosophy | 30 | ph-631–660 |
| Analytic Philosophy | The birth of analytic philosophy | 25 | ph-661–685 |
|  | Wittgenstein | 20 | ph-686–705 |
|  | Logical positivism and its collapse | 25 | ph-706–730 |
|  | Meaning, reference and language | 25 | ph-731–755 |
| Metaphysics, Epistemology and Mind | Metaphysics | 30 | ph-756–785 |
|  | Epistemology | 30 | ph-786–815 |
|  | Philosophy of mind | 30 | ph-816–845 |
|  | Philosophy of science | 25 | ph-846–870 |
| Ethics, Politics and Aesthetics | Metaethics | 20 | ph-871–890 |
|  | Normative ethics | 30 | ph-891–920 |
|  | Applied ethics | 25 | ph-921–945 |
|  | Political philosophy | 35 | ph-946–980 |
|  | Aesthetics and the philosophy of art | 20 | ph-981–1000 |

Deck totals: Foundations, Method and Logic 100 · Ancient Mediterranean Philosophy 125 · Indian, Chinese and Japanese Philosophy 115 · Medieval, Islamic and Jewish Philosophy 95 · Early Modern Philosophy 115 · The Nineteenth Century and Continental Philosophy 110 · Analytic Philosophy 95 · Metaphysics, Epistemology and Mind 115 · Ethics, Politics and Aesthetics 130. **1000.**
## What the weighting is arguing

**Ancient Mediterranean philosophy takes 125, the largest historical deck, and Plato and Aristotle take
60 of it between them.** Nothing else in the collection is load-bearing for as much of what follows:
the theory of Forms, hylomorphism, the four causes, eudaimonia and the syllogism are the vocabulary that
the medievals, the Islamic falasifa, the scholastics and a good deal of the twentieth century are
arguing *with*. A reader who skips this deck cannot read deck 4 at all.

**Ethics, Politics and Aesthetics takes 130, the largest deck in the collection**, and it is the one a
reader is most likely to have come for. It is also the part of philosophy with the most direct claim on
somebody's actual decisions, which is why applied ethics gets 25 of its own rather than being folded
into normative theory as examples.

**Deck 3 takes 115 and that is the second-largest historical deck**, deliberately larger than the
medieval one. Buddhist philosophy alone gets 30, which is more than most survey courses give the whole
of Asia, because its treatment of the self, of causation and of emptiness is philosophically continuous
with arguments in deck 8 that a reader will meet again under different names.

**Logic gets 30 cards and philosophy of logic and mathematics another 25.** This is more than a general
collection usually spends and it is spent for the same reason Psychology spends a deck on methods: the
apparatus is what lets a reader evaluate the rest. `ph-023` validity and `ph-024` soundness are
prerequisites for most of the collection, and a reader who cannot tell them apart will misread every
argument card in it.

**Analytic philosophy gets 95 and continental 110, and the near-parity is a decision.** English-language
teaching usually spends far more on the analytic tradition and Folio's own reading audience is
English-speaking, but a collection that mirrored that would be teaching a discipline's local
institutional history as though it were the shape of the subject. `ph-017` cards the split itself.

**Wittgenstein gets a subdeck of 20 to himself and nobody else does.** He is the only figure who
produced two bodies of work that are argued about separately, and the second one is the origin of a way
of doing philosophy that half of deck 7 is a reaction to. Plato and Aristotle get more cards, but inside
a period deck; this is the only single-person leaf in the collection.

## Six decisions this plan forced on the tree

**The systematic decks come last and the historical decks come first, rather than the other way round.**
Both orders are defensible and this one is chosen for a specific reason: `ph-788` (the Gettier problem)
is unintelligible without `ph-167` (knowledge as justified true belief), and `ph-824` (functionalism)
without `ph-469` (Cartesian dualism). The systematic decks are full of moves whose point is what they
are moving away from.

**Deck 3 sits third, in chronological position, and this is the most consequential structural decision
here.** It is argued in the scope section above and it is the one thing about this tree that could not
be changed later without the change being visible as a demotion.

**Islamic philosophy is 30 cards inside the medieval deck, not a deck of its own.** Two readings
compete. A deck of its own says the tradition matters; putting it inside the medieval deck says it is
*part of* medieval philosophy rather than a parallel to it, which is the historically accurate claim —
al-Farabi and Avicenna are read by Aquinas, and Averroes has a Latin afterlife under his own Latinised
name. The deck's title names all three traditions so nobody has to guess.

**There is no "great philosophers" deck**, for the reason the Psychology plan gives for having no
"famous experiments" deck. Every figure is carded where their arguments belong, and the biography cards
that do exist (`ph-132` Socrates, `ph-146` Plato, `ph-505` Hume, `ph-521` Kant) open a run of argument
cards rather than standing alone.

**Aesthetics is 20 cards at the end of deck 9, and that is the thinnest treatment in the collection.**
Stated rather than hidden: it is a real subfield with a real literature, and 20 cards can carry the
concept of art, aesthetic experience, the two classic paradoxes and the art-and-morality question, and
not much else. If the collection is ever extended, this is where the first 30 cards should go.

**`ph-1000` is "The future of philosophy" and `ps-1000` is "Where psychology is going".** Both plans end
on the same shape by design: a collection that ends on its last technical term ends as a list, and a
reader who has worked through a thousand cards has earned a card about what the subject is now for.

## Argument, not doxography — and the four pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Four things pull a philosophy card away from philosophy.

**Doxography.** The strongest pull by far, and it is scope decision two restated as a warning: it is much
easier to write "Descartes held that…" ten times than to write the argument once. The test is whether
the card would let a reader *use* the idea — spot an instance of it, or say what would count against it.
A card that only reports who held what is a card about the history of opinion.

**The textbook potted version.** Philosophy has an unusually large supply of confident summaries that
misdescribe their originals: Ockham's razor as "the simplest explanation is best", the categorical
imperative as the golden rule, Hume as denying causation, Nietzsche as a nihilist, Machiavelli as
recommending cruelty, Schrödinger's cat as philosophy. Where the potted version is what a reader
arrives holding, the card names it and corrects it — the Psychology plan's rule about carding myths as
myths, one subject over.

**The philosopher's own frame.** Every major figure has a vocabulary designed to make their conclusion
look inevitable, and a card written inside it has adopted the argument rather than described it. Write
`ph-621` (existence precedes essence) so that a reader can see what it denies; write `ph-479` (God or
Nature) so that a reader can see why contemporaries called it atheism and why Spinoza denied it.

**Contemporary politics.** Deck 9 contains most of what people argue about on the internet, and
`ph-925` abortion, `ph-942` capital punishment, `ph-969` libertarianism and `ph-979` feminist political
philosophy are all live. The rule is the Second World War plan's: give the strongest form of each
position, name whose it is, and do not adjudicate — while declining to treat a question as open merely
because it is contested politically. A bad argument is a bad argument whichever side makes it.

## This collection is EXCLUDED from the no-researchers rule

**Exactly as `psych` is, and for the same reason** — recorded on request in Aug 2026 and stated in
CLAUDE.md at the rule itself. In philosophy the thinkers ARE the subject matter: an argument carries its
author's name, most of the figures are "modern" by the history plans' measure, and half the collection's
answer terms are people or their named works. A question may say *Kant*, *Quine*, *Rawls*, *Nagarjuna*
or *Anscombe*, and `.claude/card-focus.js`'s flags on a `ph-` card are noise rather than findings — do
not clear them one at a time through `EXEMPT`.

**What still binds is the historiography cap**, and here it does real work. An abstract may narrate the
argument and its reception; what is capped at three of ten sentences is the *secondary literature* about
it — which commentator reads which passage which way. The exception is the cards whose subject IS the
scholarly dispute (`ph-133` the Socratic problem, `ph-123` the Presocratic sources problem, `ph-617`
Heidegger and National Socialism, `ph-704` the reception of Wittgenstein), where the argument about the
text is the answer term.

## Names, terms and texts

**A work is cited by its standard divisions, not by page number.** Stephanus numbers for Plato, Bekker
for Aristotle, the A/B pagination for the first Critique, part and proposition for the Ethics,
proposition number for the Tractatus, section for the Investigations. These are what every edition
carries and what a reader can follow into whichever translation they have; a page number in one
translation is a reference nobody else can use. **`cardYears` cannot read a Bekker page**, which is
noted under the date-line rules below.

**Transliteration follows each tradition's current scholarly standard, with the older form as a glossary
alias.** Sanskrit and Pali in IAST without diacritics in the answer term where the term has an English
form (*karma*, *nirvana*, *atman*), Pinyin for Chinese (*Zhuangzi*, *Dao De Jing*) with Wade-Giles as an
alias, and standard forms for Arabic names (*Ibn Sina* is carded under the Latinised *Avicenna*, which is
how the English literature indexes him, with both as aliases). **The glossary must carry both spellings
wherever they differ**, or a card writing *Laozi* will not link to a term keyed `Lao_Tzu`.

**A date line on a philosophy card is usually a person's dates or a work's publication.** `Lived` for a
figure, `Written` or `Published` for a text, `Composed` where the date is a span and the author unknown
(the Upanishads, the Dao De Jing). **`Published` is a modern-act label that the history plans restrict,
and here it is correct** — a book's publication is the event the card is dating.

**Deep and uncertain dates need the compact notation the date line already understands**: `c. 500 BCE`,
`c. 800 – 200 BCE` for the Upanishads. **A century alone yields no sort year** (see the date-line note in
CLAUDE.md), so write the span the century means rather than "5th century BCE" alone — several cards in
decks 2, 3 and 4 will hit this.

**Where a text's authorship or date is disputed, the card says so.** This is routine in this subject
rather than exceptional: the Socratic problem, the authenticity of Plato's letters, which Upanishads are
early, whether Laozi existed, and the composite authorship of most of the Chinese classics. Give the
range and whose it is, per the standing rule.

## Sourcing

**The best-sourced collection on the site, with one specific trap.**

**The primary texts are almost all open.** Perseus for the Greek and Latin, Project Gutenberg and the
Internet Archive for the early modern canon, SuttaCentral and Access to Insight for the Pali, the
Chinese Text Project for the classical Chinese with parallel translations, and Folio's own Library for
thirteen of them (below). Cite the text by its standard divisions and the translation you actually read.

**The secondary literature has a source that passes the house bar outright: the Stanford Encyclopedia of
Philosophy.** `docs/glossary-citation-plan.md` settled that an encyclopedia may be cited where that
article cites its own sources, tested per article rather than per publisher — and every SEP article is
signed by a named specialist, peer-reviewed and carries a full bibliography, which is more than most of
the encyclopedias that pass. The **Internet Encyclopedia of Philosophy** and **PhilPapers** are the other
two open routes; PhilPapers is a bibliography rather than a source and is used to *find* the work, not
to cite it.

**The trap is that philosophy's open sources are unusually old.** The out-of-copyright translations that
turn up first — Jowett's Plato, the Victorian Aristotle, the nineteenth-century Kant — are exactly the
ones whose renderings the scholarship has since argued about, and some of them make a philosopher say
something they do not. **Where a card turns on a particular word, check the translation against a modern
one and say which you used.** This is the philosophy form of the Japan plan's warning about age not being
authority.

**Two more.** A **preprint on PhilArchive is not peer-reviewed** and is labelled as such, as PsyArXiv is
in the Psychology plan. And **a philosopher's own summary of an opponent is not a source for the
opponent's view** — this is the single most common way a card comes to state a position nobody held.

## Living beside the other collections

**FOUR collections already card these same people, and every pair should be written deliberately.**
Ancient Greece cards `gr-627` Socrates, `gr-677` Plato, `gr-682` Aristotle and `gr-838` Stoicism; China
cards `cnh-828` Confucius, `cnh-834` Mencius, `cnh-837` Laozi and `cnh-842` Zhuangzi; Rome and India
will card their own. **The division is clean and it is the same one every time: those collections card
the person in their time and place, and this one cards the argument.** `gr-679` is Plato's Republic as a
book written in fourth-century Athens; `ph-151` is the Republic as an argument about justice, and
`ph-152` to `ph-157` take that argument apart. Ten sentences on Confucius the figure in a Chinese
history deck is a different card from ten sentences on `ph-290` *ren*.

**Psychology is the closest neighbour and shares a whole subject with this one.** Philosophy of mind
(`ph-816`–`ph-845`) and psychology's own foundations (`ps-001`–`ps-045`) meet at consciousness, the
mind–body problem, free will and the self. The division: **psychology asks what is the case and
philosophy asks what would settle it.** `ps-516` Consciousness is what the science has established;
`ph-832` The hard problem is the argument that the science cannot settle it.
**One topic is deliberately carded in both collections under the same name** — `ps-518` and `ph-832` are
each "The hard problem of consciousness" — and that is the pair to write most carefully: the psychology
card meets it as the limit the science runs into, the philosophy card as an argument with a structure
and objections. Write them together or the second one written will restate the first.

**THIRTEEN OF THIS COLLECTION'S PRIMARY TEXTS ARE ALREADY IN FOLIO'S LIBRARY**, which no other
collection can say to this degree: the *Nicomachean Ethics*, the *Republic*, Plato's *Dialogues*, the
*Meditations* of Marcus Aurelius, Seneca's *Letters*, Lucretius' *On the Nature of Things*, Boethius'
*Consolation*, Augustine's *Confessions* and *City of God*, the *Summa Theologica*, the *Analects*, the
*Bhagavad Gita* and Machiavelli's *Prince* — eleven of them with their original-language column
(the *Republic* and the *Summa* are the two without). **So
`card.quote` is worth more here than anywhere on the site**: a card may set an authored passage from the
book it cites between the two halves of its background, with a button that opens that book at the
section. See the Library bullet in CLAUDE.md for the rules — the passage is AUTHORED rather than
extracted, and `add-card.js` checks the reference against the real shelf.

**The glossary collision check was run when this plan was written.** Of the head words this collection
will want, **none is currently in `GLOSSARY` or `GLOSSARY_ALIASES`** — but several are ordinary English
words that will need `GLOSSARY_CASESENSITIVE` or a narrower key, exactly as `Boreal` did: *substance*,
*form*, *idea*, *will*, *sense*, *reference*, *validity*, *soundness*, *character*, *duty* and *taste*.
Two more will collide with Folio's existing prehistory and Atlas vocabulary if keyed bare: *emptiness*
and *the One*. Re-run the check before writing a term, not before writing the batch.

**The card ships with its glossary term, cited at the bar** — the standing rule in
`docs/card-glossary-pairing.md`. This collection's vocabulary starts from nothing and is larger than any
other's, so that rule does more work here than anywhere.

# The list

## Foundations, Method and Logic

### What philosophy is — `ph-what`

    ph-001  Philosophy
    ph-002  The branches of philosophy
    ph-003  Metaphysics
    ph-004  Epistemology
    ph-005  Ethics
    ph-006  Logic
    ph-007  Aesthetics
    ph-008  Political philosophy
    ph-009  The philosophical question
    ph-010  Conceptual analysis
    ph-011  The thought experiment
    ph-012  Intuitions in philosophy
    ph-013  Philosophy and science
    ph-014  Philosophy and religion
    ph-015  Philosophy and common sense
    ph-016  The history of philosophy as philosophy
    ph-017  Analytic and continental philosophy
    ph-018  Philosophical method
    ph-019  Reflective equilibrium
    ph-020  What philosophical progress would look like

### Argument, reasoning and fallacies — `ph-argument`

    ph-021  Argument
    ph-022  Premises and conclusions
    ph-023  Validity
    ph-024  Soundness
    ph-025  Deduction
    ph-026  Induction
    ph-027  The problem of induction
    ph-028  Abduction
    ph-029  Inference to the best explanation
    ph-030  Necessary and sufficient conditions
    ph-031  Counterexample
    ph-032  Reductio ad absurdum
    ph-033  Begging the question
    ph-034  The straw man fallacy
    ph-035  Ad hominem
    ph-036  The genetic fallacy
    ph-037  Equivocation
    ph-038  False dilemma
    ph-039  The slippery slope argument
    ph-040  Appeal to authority
    ph-041  Circular reasoning
    ph-042  The naturalistic fallacy
    ph-043  Formal and informal fallacies
    ph-044  Paradox
    ph-045  The principle of charity

### Formal logic — `ph-logic`

    ph-046  Formal logic
    ph-047  Propositional logic
    ph-048  Truth functions
    ph-049  The truth table
    ph-050  Conjunction, disjunction and negation
    ph-051  The material conditional
    ph-052  The paradoxes of material implication
    ph-053  Logical equivalence
    ph-054  Natural deduction
    ph-055  The axiomatic method
    ph-056  Predicate logic
    ph-057  Quantifiers
    ph-058  Identity in logic
    ph-059  Definite descriptions
    ph-060  Syllogistic logic
    ph-061  The square of opposition
    ph-062  Modal logic
    ph-063  Possible worlds
    ph-064  Necessity and possibility
    ph-065  Deontic logic
    ph-066  Temporal logic
    ph-067  Epistemic logic
    ph-068  Many-valued logic
    ph-069  Intuitionistic logic
    ph-070  Paraconsistent logic
    ph-071  Second-order logic
    ph-072  Soundness and completeness of a logical system
    ph-073  Gödel's incompleteness theorems
    ph-074  The Löwenheim–Skolem theorem
    ph-075  Set theory and logic

### Philosophy of logic and mathematics — `ph-philmath`

    ph-076  Philosophy of logic
    ph-077  Logical consequence
    ph-078  Logical form
    ph-079  Logical constants
    ph-080  Truth
    ph-081  The correspondence theory of truth
    ph-082  The coherence theory of truth
    ph-083  Deflationary theories of truth
    ph-084  The liar paradox
    ph-085  Tarski's theory of truth
    ph-086  Vagueness
    ph-087  The sorites paradox
    ph-088  Philosophy of mathematics
    ph-089  Mathematical Platonism
    ph-090  Logicism
    ph-091  Frege's programme
    ph-092  Russell's paradox
    ph-093  Formalism in mathematics
    ph-094  Intuitionism in mathematics
    ph-095  Nominalism about mathematics
    ph-096  The indispensability argument
    ph-097  Mathematical proof
    ph-098  Infinity
    ph-099  Cantor and the transfinite
    ph-100  The unreasonable effectiveness of mathematics

## Ancient Mediterranean Philosophy

### The Presocratics — `ph-presocratic`

    ph-101  Presocratic philosophy
    ph-102  The Milesian school
    ph-103  Thales
    ph-104  Anaximander
    ph-105  Anaximenes
    ph-106  The arche
    ph-107  Pythagoras
    ph-108  Pythagoreanism
    ph-109  Xenophanes
    ph-110  Heraclitus
    ph-111  Flux and the unity of opposites
    ph-112  The logos
    ph-113  Parmenides
    ph-114  The way of truth and the way of opinion
    ph-115  Zeno of Elea
    ph-116  Zeno's paradoxes
    ph-117  Empedocles
    ph-118  The four elements
    ph-119  Anaxagoras
    ph-120  Nous
    ph-121  Leucippus and Democritus
    ph-122  Ancient atomism
    ph-123  The Presocratic sources problem
    ph-124  Cosmology before philosophy
    ph-125  What the Presocratics were doing

### Socrates and the sophists — `ph-socrates`

    ph-126  The sophists
    ph-127  Protagoras
    ph-128  Man is the measure of all things
    ph-129  Gorgias
    ph-130  Nomos and physis
    ph-131  Rhetoric and philosophy
    ph-132  Socrates
    ph-133  The Socratic problem
    ph-134  The Socratic method
    ph-135  Socratic ignorance
    ph-136  The unexamined life
    ph-137  Socratic intellectualism
    ph-138  The trial of Socrates
    ph-139  The Apology
    ph-140  The Crito and the duty to obey
    ph-141  The Euthyphro dilemma
    ph-142  Definition in the early dialogues
    ph-143  The Socratic schools
    ph-144  The Cynics
    ph-145  Diogenes of Sinope

### Plato — `ph-plato`

    ph-146  Plato
    ph-147  The Platonic dialogue
    ph-148  The theory of Forms
    ph-149  Participation
    ph-150  The third man argument
    ph-151  The Republic
    ph-152  Justice in the Republic
    ph-153  The tripartite soul
    ph-154  The philosopher-king
    ph-155  The allegory of the cave
    ph-156  The divided line
    ph-157  The Form of the Good
    ph-158  The Meno
    ph-159  Recollection
    ph-160  The Meno's paradox of inquiry
    ph-161  The Phaedo
    ph-162  Arguments for the immortality of the soul
    ph-163  The Symposium
    ph-164  Platonic love
    ph-165  The Phaedrus
    ph-166  The Theaetetus
    ph-167  Knowledge as justified true belief
    ph-168  The Sophist
    ph-169  The problem of not-being
    ph-170  The Parmenides
    ph-171  The Timaeus
    ph-172  The demiurge
    ph-173  The Laws
    ph-174  The Academy
    ph-175  Plato's critique of writing and art

### Aristotle — `ph-aristotle`

    ph-176  Aristotle
    ph-177  The Aristotelian corpus
    ph-178  The categories
    ph-179  Substance
    ph-180  Hylomorphism
    ph-181  Matter and form
    ph-182  The four causes
    ph-183  Potentiality and actuality
    ph-184  Teleology in nature
    ph-185  The Physics
    ph-186  Aristotle on motion and place
    ph-187  Aristotle on time
    ph-188  The Metaphysics
    ph-189  Being qua being
    ph-190  The unmoved mover
    ph-191  The Organon
    ph-192  The syllogism
    ph-193  The Posterior Analytics
    ph-194  Scientific demonstration
    ph-195  The Nicomachean Ethics
    ph-196  Eudaimonia
    ph-197  Virtue as a mean
    ph-198  Practical wisdom
    ph-199  Akrasia
    ph-200  Friendship in Aristotle
    ph-201  The Politics
    ph-202  Man as a political animal
    ph-203  Aristotle on slavery
    ph-204  The Poetics
    ph-205  Catharsis and tragedy

### Hellenistic and Roman philosophy — `ph-hellenistic`

    ph-206  Hellenistic philosophy
    ph-207  Epicurus
    ph-208  Epicureanism
    ph-209  Epicurean atomism and the swerve
    ph-210  The Epicurean account of pleasure
    ph-211  Lucretius
    ph-212  Stoicism
    ph-213  Zeno of Citium and the early Stoa
    ph-214  Stoic physics and the logos
    ph-215  Stoic logic
    ph-216  The Stoic passions
    ph-217  Living according to nature
    ph-218  Epictetus
    ph-219  Seneca
    ph-220  Marcus Aurelius
    ph-221  Ancient scepticism
    ph-222  Pyrrho and Pyrrhonism
    ph-223  Sextus Empiricus
    ph-224  The Academic sceptics
    ph-225  Philosophy as a way of life

## Indian, Chinese and Japanese Philosophy

### Classical Indian philosophy — `ph-indian`

    ph-226  Indian philosophy
    ph-227  The Vedas
    ph-228  The Upanishads
    ph-229  Brahman
    ph-230  Atman
    ph-231  Karma
    ph-232  Samsara
    ph-233  Moksha
    ph-234  The six orthodox schools
    ph-235  Samkhya
    ph-236  Purusha and prakriti
    ph-237  Yoga philosophy
    ph-238  Nyaya
    ph-239  Indian theories of inference
    ph-240  Vaisheshika
    ph-241  Indian atomism
    ph-242  Mimamsa
    ph-243  Vedanta
    ph-244  Advaita Vedanta
    ph-245  Shankara
    ph-246  Maya
    ph-247  Vishishtadvaita
    ph-248  Ramanuja
    ph-249  Dvaita Vedanta
    ph-250  The Bhagavad Gita
    ph-251  Dharma
    ph-252  Jain philosophy
    ph-253  Anekantavada
    ph-254  Charvaka materialism
    ph-255  The pramanas

### Buddhist philosophy — `ph-buddhist`

    ph-256  Buddhist philosophy
    ph-257  The Buddha
    ph-258  The Four Noble Truths
    ph-259  Dukkha
    ph-260  The Eightfold Path
    ph-261  Anatta
    ph-262  Anicca
    ph-263  Dependent origination
    ph-264  Nirvana
    ph-265  The five aggregates
    ph-266  The Abhidharma
    ph-267  Theravada philosophy
    ph-268  Mahayana philosophy
    ph-269  Emptiness
    ph-270  Nagarjuna
    ph-271  The Madhyamaka
    ph-272  The two truths doctrine
    ph-273  The tetralemma
    ph-274  Yogacara
    ph-275  Consciousness-only
    ph-276  Vasubandhu
    ph-277  Buddhist logic and epistemology
    ph-278  Dignaga and Dharmakirti
    ph-279  Buddhist ethics
    ph-280  Compassion in Buddhist thought
    ph-281  Buddhist philosophy of mind
    ph-282  The Buddhist no-self in modern philosophy
    ph-283  Chan and Zen philosophy
    ph-284  Tibetan Buddhist philosophy
    ph-285  The Buddhist–Hindu debates

### Chinese philosophy — `ph-chinese`

    ph-286  Chinese philosophy
    ph-287  The Hundred Schools of Thought
    ph-288  Confucius
    ph-289  The Analects
    ph-290  Ren
    ph-291  Li in Confucian thought
    ph-292  The junzi
    ph-293  Filial piety
    ph-294  The rectification of names
    ph-295  Mencius
    ph-296  Human nature is good
    ph-297  Xunzi
    ph-298  Human nature is bad
    ph-299  Daoism
    ph-300  Laozi
    ph-301  The Dao De Jing
    ph-302  The Dao
    ph-303  Wu wei
    ph-304  Zhuangzi
    ph-305  The butterfly dream
    ph-306  Mohism
    ph-307  Universal love
    ph-308  Mohist logic
    ph-309  Legalism
    ph-310  Han Feizi
    ph-311  The School of Names
    ph-312  Gongsun Long and the white horse
    ph-313  Yin and yang
    ph-314  The Book of Changes
    ph-315  Chinese Buddhism
    ph-316  Neo-Confucianism
    ph-317  Zhu Xi
    ph-318  Principle and material force
    ph-319  Wang Yangming
    ph-320  The unity of knowledge and action

### Japanese and modern Asian philosophy — `ph-japan`

    ph-321  Japanese philosophy
    ph-322  Shinto thought
    ph-323  Japanese Buddhist philosophy
    ph-324  Dogen
    ph-325  Zen and the philosophy of practice
    ph-326  Bushido as a philosophical text
    ph-327  The Kyoto School
    ph-328  Nishida Kitaro
    ph-329  Absolute nothingness
    ph-330  Watsuji Tetsuro
    ph-331  Modern Indian philosophy
    ph-332  Vivekananda and neo-Vedanta
    ph-333  Aurobindo
    ph-334  Gandhi's philosophy of nonviolence
    ph-335  Ambedkar's critique of caste
    ph-336  New Confucianism
    ph-337  Chinese Marxism as philosophy
    ph-338  Comparative philosophy
    ph-339  Translating philosophical terms across traditions
    ph-340  Whether "philosophy" is the right word for these traditions

## Medieval, Islamic and Jewish Philosophy

### Late antiquity and Augustine — `ph-lateantique`

    ph-341  Late antique philosophy
    ph-342  Middle Platonism
    ph-343  Neoplatonism
    ph-344  Plotinus
    ph-345  The One
    ph-346  Emanation
    ph-347  Porphyry
    ph-348  Proclus
    ph-349  The closing of the Academy
    ph-350  Early Christian philosophy
    ph-351  Philosophy and revelation
    ph-352  Augustine of Hippo
    ph-353  The Confessions
    ph-354  Augustine on time
    ph-355  Augustine on the will
    ph-356  Original sin and grace
    ph-357  The City of God
    ph-358  Augustine on evil
    ph-359  Boethius
    ph-360  The Consolation of Philosophy

### Philosophy in the Islamic world — `ph-islamic`

    ph-361  Philosophy in the Islamic world
    ph-362  The translation movement
    ph-363  Falsafa
    ph-364  Kalam
    ph-365  The Mu'tazila
    ph-366  The Ash'arites
    ph-367  Al-Kindi
    ph-368  Al-Razi
    ph-369  Al-Farabi
    ph-370  The virtuous city
    ph-371  Avicenna
    ph-372  The flying man argument
    ph-373  Avicenna on essence and existence
    ph-374  The necessary existent
    ph-375  Al-Ghazali
    ph-376  The Incoherence of the Philosophers
    ph-377  Al-Ghazali on causation
    ph-378  Averroes
    ph-379  The Incoherence of the Incoherence
    ph-380  Averroes on religion and philosophy
    ph-381  The unity of the intellect
    ph-382  Ibn Tufayl and the self-taught philosopher
    ph-383  Suhrawardi and illuminationism
    ph-384  Mulla Sadra
    ph-385  Sufi philosophy
    ph-386  Ibn Arabi
    ph-387  Ibn Khaldun
    ph-388  The transmission of Aristotle to the Latin West
    ph-389  Islamic philosophy after Averroes
    ph-390  Modern Islamic philosophy

### Jewish philosophy — `ph-jewish`

    ph-391  Jewish philosophy
    ph-392  Philo of Alexandria
    ph-393  Saadia Gaon
    ph-394  Judah Halevi
    ph-395  Maimonides
    ph-396  The Guide for the Perplexed
    ph-397  Negative theology
    ph-398  Maimonides on prophecy
    ph-399  Gersonides
    ph-400  Hasdai Crescas
    ph-401  Jewish Aristotelianism and its critics
    ph-402  Kabbalah as philosophy
    ph-403  Spinoza's Jewish context
    ph-404  Hermann Cohen
    ph-405  Levinas and the ethics of the other

### Scholasticism — `ph-scholastic`

    ph-406  Scholasticism
    ph-407  The medieval university
    ph-408  The problem of universals
    ph-409  Realism about universals
    ph-410  Nominalism
    ph-411  Conceptualism
    ph-412  Anselm of Canterbury
    ph-413  The ontological argument
    ph-414  Faith seeking understanding
    ph-415  Peter Abelard
    ph-416  Abelard on intention and ethics
    ph-417  Thomas Aquinas
    ph-418  The Summa Theologiae
    ph-419  The five ways
    ph-420  Aquinas on analogy
    ph-421  Natural law
    ph-422  Aquinas on the soul
    ph-423  The Condemnations of 1277
    ph-424  Bonaventure
    ph-425  Duns Scotus
    ph-426  Haecceity
    ph-427  The univocity of being
    ph-428  William of Ockham
    ph-429  Ockham's razor
    ph-430  Ockham's nominalism
    ph-431  Divine command and voluntarism
    ph-432  The Oxford Calculators
    ph-433  Buridan and the ass
    ph-434  Late scholastic logic
    ph-435  The end of scholasticism

## Early Modern Philosophy

### Renaissance and the scientific revolution — `ph-renaissance`

    ph-436  Renaissance philosophy
    ph-437  Humanism
    ph-438  The recovery of ancient texts
    ph-439  Pico della Mirandola
    ph-440  Machiavelli
    ph-441  The Prince and political realism
    ph-442  Montaigne
    ph-443  The essay as philosophy
    ph-444  Renaissance scepticism
    ph-445  Giordano Bruno
    ph-446  The scientific revolution
    ph-447  Copernicus and the new cosmology
    ph-448  Galileo
    ph-449  The book of nature written in mathematics
    ph-450  Francis Bacon
    ph-451  The idols of the mind
    ph-452  Baconian induction
    ph-453  Thomas Hobbes
    ph-454  The state of nature
    ph-455  Leviathan
    ph-456  Hobbes on the social contract
    ph-457  Hobbesian materialism
    ph-458  The mechanical philosophy
    ph-459  Primary and secondary qualities
    ph-460  The new science and the soul

### The rationalists — `ph-rationalists`

    ph-461  Rationalism
    ph-462  René Descartes
    ph-463  The Meditations on First Philosophy
    ph-464  Methodical doubt
    ph-465  The evil demon
    ph-466  The cogito
    ph-467  The Cartesian circle
    ph-468  Descartes's proofs of God
    ph-469  Cartesian dualism
    ph-470  The mind–body problem in Descartes
    ph-471  The pineal gland
    ph-472  Cartesian science
    ph-473  Elisabeth of Bohemia's objection
    ph-474  Occasionalism
    ph-475  Malebranche
    ph-476  Baruch Spinoza
    ph-477  The Ethics
    ph-478  Substance monism
    ph-479  God or Nature
    ph-480  Spinoza on the attributes
    ph-481  Spinoza on freedom and necessity
    ph-482  The Theological-Political Treatise
    ph-483  Gottfried Wilhelm Leibniz
    ph-484  The monadology
    ph-485  Pre-established harmony
    ph-486  The principle of sufficient reason
    ph-487  The identity of indiscernibles
    ph-488  The best of all possible worlds
    ph-489  Leibniz on necessity and contingency
    ph-490  Innate knowledge

### The empiricists — `ph-empiricists`

    ph-491  Empiricism
    ph-492  John Locke
    ph-493  An Essay Concerning Human Understanding
    ph-494  The tabula rasa
    ph-495  Locke's theory of ideas
    ph-496  Locke on personal identity
    ph-497  Locke on substance
    ph-498  Locke's Two Treatises
    ph-499  Locke on property
    ph-500  Toleration
    ph-501  George Berkeley
    ph-502  Idealism
    ph-503  To be is to be perceived
    ph-504  Berkeley's attack on abstract ideas
    ph-505  David Hume
    ph-506  A Treatise of Human Nature
    ph-507  Impressions and ideas
    ph-508  Hume on causation
    ph-509  Constant conjunction
    ph-510  Hume's fork
    ph-511  Hume on the self
    ph-512  Hume on miracles
    ph-513  Hume on induction
    ph-514  Hume's moral sentimentalism
    ph-515  Is and ought
    ph-516  The Dialogues Concerning Natural Religion
    ph-517  The design argument and its critics
    ph-518  Thomas Reid and common sense
    ph-519  Adam Smith's moral philosophy
    ph-520  The Scottish Enlightenment

### Kant — `ph-kant`

    ph-521  Immanuel Kant
    ph-522  The critical philosophy
    ph-523  The Critique of Pure Reason
    ph-524  The Copernican turn
    ph-525  Analytic and synthetic judgements
    ph-526  A priori and a posteriori
    ph-527  Synthetic a priori knowledge
    ph-528  The transcendental aesthetic
    ph-529  Space and time as forms of intuition
    ph-530  The categories of the understanding
    ph-531  The transcendental deduction
    ph-532  Phenomena and noumena
    ph-533  The thing in itself
    ph-534  The paralogisms
    ph-535  The antinomies of pure reason
    ph-536  Kant's critique of the ontological argument
    ph-537  The Groundwork of the Metaphysics of Morals
    ph-538  The good will
    ph-539  The categorical imperative
    ph-540  The formula of universal law
    ph-541  The formula of humanity
    ph-542  Autonomy
    ph-543  The kingdom of ends
    ph-544  The Critique of Practical Reason
    ph-545  The postulates of practical reason
    ph-546  The Critique of the Power of Judgement
    ph-547  The judgement of taste
    ph-548  The sublime
    ph-549  Kant's political writings
    ph-550  Perpetual peace

## The Nineteenth Century and Continental Philosophy

### German idealism and its critics — `ph-idealism`

    ph-551  German idealism
    ph-552  The reception of Kant
    ph-553  Fichte
    ph-554  The I and the not-I
    ph-555  Schelling
    ph-556  Naturphilosophie
    ph-557  G. W. F. Hegel
    ph-558  The Phenomenology of Spirit
    ph-559  Dialectic
    ph-560  The master–slave dialectic
    ph-561  Spirit
    ph-562  Hegel's Logic
    ph-563  The Philosophy of Right
    ph-564  Hegel's philosophy of history
    ph-565  The end of history
    ph-566  The Young Hegelians
    ph-567  Feuerbach
    ph-568  Religion as projection
    ph-569  Arthur Schopenhauer
    ph-570  The World as Will and Representation
    ph-571  The will
    ph-572  Schopenhauer's pessimism
    ph-573  Romanticism and philosophy
    ph-574  Hermeneutics before Heidegger
    ph-575  Historicism

### Marx, Kierkegaard and Nietzsche — `ph-critics`

    ph-576  Karl Marx
    ph-577  Historical materialism
    ph-578  Alienation
    ph-579  The critique of ideology
    ph-580  Base and superstructure
    ph-581  Class struggle
    ph-582  Marx's critique of political economy
    ph-583  Commodity fetishism
    ph-584  The Communist Manifesto
    ph-585  Marx on freedom
    ph-586  Søren Kierkegaard
    ph-587  The single individual
    ph-588  The stages of life's way
    ph-589  The leap of faith
    ph-590  Fear and Trembling
    ph-591  Anxiety and despair
    ph-592  Kierkegaard's critique of Hegel
    ph-593  Friedrich Nietzsche
    ph-594  The death of God
    ph-595  The genealogical method
    ph-596  Master and slave morality
    ph-597  The will to power
    ph-598  Eternal recurrence
    ph-599  The Übermensch
    ph-600  Nietzsche's perspectivism

### Phenomenology and existentialism — `ph-phenomenology`

    ph-601  Phenomenology
    ph-602  Franz Brentano and intentionality
    ph-603  Edmund Husserl
    ph-604  The phenomenological reduction
    ph-605  The natural attitude
    ph-606  The life-world
    ph-607  Eidetic intuition
    ph-608  Martin Heidegger
    ph-609  Being and Time
    ph-610  Dasein
    ph-611  Being-in-the-world
    ph-612  Ready-to-hand and present-at-hand
    ph-613  Authenticity
    ph-614  Being-towards-death
    ph-615  The question of being
    ph-616  Heidegger's later thought
    ph-617  Heidegger and National Socialism
    ph-618  Existentialism
    ph-619  Jean-Paul Sartre
    ph-620  Being and Nothingness
    ph-621  Existence precedes essence
    ph-622  Radical freedom
    ph-623  Bad faith
    ph-624  Simone de Beauvoir
    ph-625  The Second Sex
    ph-626  One is not born a woman
    ph-627  Albert Camus
    ph-628  The absurd
    ph-629  Maurice Merleau-Ponty
    ph-630  The phenomenology of the body

### Critical theory, feminist and decolonial philosophy — `ph-critical`

    ph-631  Critical theory
    ph-632  The Frankfurt School
    ph-633  Adorno and Horkheimer
    ph-634  Dialectic of Enlightenment
    ph-635  The culture industry
    ph-636  Herbert Marcuse
    ph-637  Jürgen Habermas
    ph-638  Communicative action
    ph-639  The public sphere
    ph-640  Structuralism
    ph-641  Saussure and the sign
    ph-642  Claude Lévi-Strauss
    ph-643  Post-structuralism
    ph-644  Michel Foucault
    ph-645  Power/knowledge
    ph-646  Discipline and punishment
    ph-647  Biopolitics
    ph-648  Jacques Derrida
    ph-649  Deconstruction
    ph-650  Différance
    ph-651  Gilles Deleuze
    ph-652  Feminist philosophy
    ph-653  Feminist epistemology
    ph-654  Standpoint theory
    ph-655  Gender performativity
    ph-656  Africana philosophy
    ph-657  Double consciousness
    ph-658  Frantz Fanon
    ph-659  Decolonial philosophy
    ph-660  Latin American philosophy of liberation

## Analytic Philosophy

### The birth of analytic philosophy — `ph-analytic-birth`

    ph-661  Analytic philosophy
    ph-662  The revolt against idealism
    ph-663  British idealism
    ph-664  G. E. Moore
    ph-665  Moore's defence of common sense
    ph-666  The open question argument
    ph-667  Bertrand Russell
    ph-668  The theory of descriptions
    ph-669  Logical atomism
    ph-670  Knowledge by acquaintance and by description
    ph-671  Principia Mathematica
    ph-672  Gottlob Frege
    ph-673  The Begriffsschrift
    ph-674  Sense and reference
    ph-675  The context principle
    ph-676  Frege on concept and object
    ph-677  The linguistic turn
    ph-678  Analysis as a philosophical method
    ph-679  The paradox of analysis
    ph-680  Logic and ordinary language
    ph-681  Alfred North Whitehead
    ph-682  Process philosophy
    ph-683  Frank Ramsey
    ph-684  C. S. Peirce and pragmatism
    ph-685  William James on truth

### Wittgenstein — `ph-wittgenstein`

    ph-686  Ludwig Wittgenstein
    ph-687  The Tractatus Logico-Philosophicus
    ph-688  The picture theory of meaning
    ph-689  Saying and showing
    ph-690  The limits of language
    ph-691  Wittgenstein's turn
    ph-692  Philosophical Investigations
    ph-693  Meaning as use
    ph-694  Language games
    ph-695  Family resemblance
    ph-696  The private language argument
    ph-697  Rule-following
    ph-698  The beetle in the box
    ph-699  Forms of life
    ph-700  Philosophy as therapy
    ph-701  On Certainty
    ph-702  Hinge propositions
    ph-703  Aspect seeing
    ph-704  The reception of Wittgenstein
    ph-705  Kripke's Wittgenstein

### Logical positivism and its collapse — `ph-positivism`

    ph-706  Logical positivism
    ph-707  The Vienna Circle
    ph-708  The verification principle
    ph-709  The elimination of metaphysics
    ph-710  Protocol sentences
    ph-711  Rudolf Carnap
    ph-712  The analytic–synthetic distinction
    ph-713  Neurath's boat
    ph-714  A. J. Ayer
    ph-715  Language, Truth and Logic
    ph-716  Emotivism
    ph-717  Karl Popper
    ph-718  Falsifiability
    ph-719  The demarcation problem
    ph-720  W. V. O. Quine
    ph-721  Two Dogmas of Empiricism
    ph-722  The web of belief
    ph-723  Ontological relativity
    ph-724  Indeterminacy of translation
    ph-725  Naturalised epistemology
    ph-726  Wilfrid Sellars
    ph-727  The myth of the given
    ph-728  Ordinary language philosophy
    ph-729  J. L. Austin
    ph-730  The ghost in the machine

### Meaning, reference and language — `ph-language`

    ph-731  Philosophy of language
    ph-732  Theories of meaning
    ph-733  Reference
    ph-734  Descriptivism about names
    ph-735  Saul Kripke
    ph-736  Naming and Necessity
    ph-737  Rigid designators
    ph-738  The causal theory of reference
    ph-739  Natural kind terms
    ph-740  Twin Earth
    ph-741  Semantic externalism
    ph-742  Sense, force and content
    ph-743  Truth-conditional semantics
    ph-744  Donald Davidson
    ph-745  Radical interpretation
    ph-746  The principle of charity in interpretation
    ph-747  Implicature
    ph-748  Pragmatics
    ph-749  Speech act theory
    ph-750  Metaphor
    ph-751  Context and indexicals
    ph-752  Compositionality
    ph-753  Linguistic relativity in philosophy
    ph-754  Conceptual engineering
    ph-755  Slurs and pejoratives

## Metaphysics, Epistemology and Mind

### Metaphysics — `ph-metaphysics`

    ph-756  Contemporary metaphysics
    ph-757  Ontology
    ph-758  Existence
    ph-759  Universals and particulars
    ph-760  Properties
    ph-761  Tropes
    ph-762  Substance in modern metaphysics
    ph-763  Essence and accident
    ph-764  Modality
    ph-765  Possible worlds realism
    ph-766  Counterparts
    ph-767  Identity
    ph-768  Identity over time
    ph-769  Personal identity
    ph-770  The psychological continuity theory
    ph-771  The bodily criterion
    ph-772  What matters in survival
    ph-773  The ship of Theseus
    ph-774  Mereology
    ph-775  The problem of the many
    ph-776  Causation
    ph-777  Regularity and counterfactual theories of causation
    ph-778  Time
    ph-779  The A-series and the B-series
    ph-780  Presentism and eternalism
    ph-781  The passage of time
    ph-782  Free will
    ph-783  Determinism
    ph-784  Compatibilism
    ph-785  Moral responsibility and alternative possibilities

### Epistemology — `ph-epistemology`

    ph-786  Knowledge
    ph-787  The tripartite analysis of knowledge
    ph-788  The Gettier problem
    ph-789  Responses to Gettier
    ph-790  Justification
    ph-791  Foundationalism
    ph-792  Coherentism
    ph-793  Infinitism
    ph-794  Internalism and externalism about justification
    ph-795  Reliabilism
    ph-796  Virtue epistemology
    ph-797  Belief
    ph-798  Degrees of belief
    ph-799  Bayesian epistemology
    ph-800  Evidence
    ph-801  Testimony
    ph-802  Memory as a source of knowledge
    ph-803  Perception as a source of knowledge
    ph-804  The a priori
    ph-805  Scepticism
    ph-806  The problem of the external world
    ph-807  The brain in a vat
    ph-808  Closure and scepticism
    ph-809  Contextualism about knowledge
    ph-810  Epistemic relativism
    ph-811  Peer disagreement
    ph-812  Social epistemology
    ph-813  Epistemic injustice
    ph-814  Expertise and epistemic autonomy
    ph-815  Understanding and wisdom

### Philosophy of mind — `ph-mind`

    ph-816  Philosophy of mind
    ph-817  The mind–body problem
    ph-818  Substance dualism
    ph-819  Property dualism
    ph-820  Physicalism
    ph-821  Behaviourism in philosophy
    ph-822  The identity theory
    ph-823  Multiple realisability
    ph-824  Functionalism
    ph-825  The computational theory of mind
    ph-826  The Chinese room argument
    ph-827  Consciousness
    ph-828  Qualia
    ph-829  The knowledge argument
    ph-830  What is it like to be a bat
    ph-831  The explanatory gap
    ph-832  The hard problem of consciousness
    ph-833  Philosophical zombies
    ph-834  Higher-order theories of consciousness
    ph-835  Global workspace and integrated information
    ph-836  Intentionality
    ph-837  Mental content
    ph-838  Internalism and externalism about content
    ph-839  The extended mind
    ph-840  Embodied cognition
    ph-841  Mental causation
    ph-842  Epiphenomenalism
    ph-843  Panpsychism
    ph-844  Animal minds
    ph-845  Machine consciousness

### Philosophy of science — `ph-science`

    ph-846  Philosophy of science
    ph-847  Scientific explanation
    ph-848  The deductive-nomological model
    ph-849  Laws of nature
    ph-850  Confirmation
    ph-851  The raven paradox
    ph-852  The new riddle of induction
    ph-853  Underdetermination
    ph-854  The Duhem–Quine thesis
    ph-855  Scientific realism
    ph-856  Instrumentalism
    ph-857  The no-miracles argument
    ph-858  The pessimistic meta-induction
    ph-859  Thomas Kuhn
    ph-860  Paradigms and scientific revolutions
    ph-861  Incommensurability
    ph-862  Research programmes
    ph-863  Paul Feyerabend
    ph-864  Values in science
    ph-865  Models and idealisation
    ph-866  Reduction and emergence
    ph-867  Philosophy of biology
    ph-868  Philosophy of physics
    ph-869  Probability and chance
    ph-870  Causal inference in science

## Ethics, Politics and Aesthetics

### Metaethics — `ph-metaethics`

    ph-871  Metaethics
    ph-872  Moral realism
    ph-873  Moral anti-realism
    ph-874  Moral relativism
    ph-875  Error theory
    ph-876  Expressivism
    ph-877  Quasi-realism
    ph-878  Moral naturalism
    ph-879  Non-naturalism
    ph-880  Moral intuitionism
    ph-881  Moral motivation
    ph-882  Internalism and externalism about moral judgement
    ph-883  Reasons for action
    ph-884  Moral epistemology
    ph-885  Moral disagreement
    ph-886  Moral luck
    ph-887  Thick and thin ethical concepts
    ph-888  Supervenience in ethics
    ph-889  The fact–value distinction
    ph-890  Evolutionary debunking arguments

### Normative ethics — `ph-normative`

    ph-891  Normative ethics
    ph-892  Consequentialism
    ph-893  Utilitarianism
    ph-894  Jeremy Bentham
    ph-895  The felicific calculus
    ph-896  John Stuart Mill
    ph-897  Higher and lower pleasures
    ph-898  Act and rule utilitarianism
    ph-899  Objections to utilitarianism
    ph-900  Deontology
    ph-901  Duty
    ph-902  Rights
    ph-903  The doctrine of double effect
    ph-904  Agent-relative and agent-neutral reasons
    ph-905  Virtue ethics
    ph-906  The revival of virtue ethics
    ph-907  Character and habituation
    ph-908  The ethics of care
    ph-909  Contractualism
    ph-910  What we owe to each other
    ph-911  Moral status
    ph-912  The trolley problem
    ph-913  Doing and allowing
    ph-914  Supererogation
    ph-915  Moral dilemmas
    ph-916  Partiality and impartiality
    ph-917  Well-being
    ph-918  Hedonism about well-being
    ph-919  Desire satisfaction and objective list theories
    ph-920  The meaning of life

### Applied ethics — `ph-applied`

    ph-921  Applied ethics
    ph-922  Bioethics
    ph-923  Autonomy and informed consent
    ph-924  Euthanasia
    ph-925  Abortion
    ph-926  The ethics of reproduction
    ph-927  Genetic enhancement
    ph-928  Animal ethics
    ph-929  Animal liberation
    ph-930  Environmental ethics
    ph-931  Climate ethics
    ph-932  Future generations
    ph-933  The non-identity problem
    ph-934  Population ethics
    ph-935  The repugnant conclusion
    ph-936  Business ethics
    ph-937  The ethics of war
    ph-938  Just war theory
    ph-939  Pacifism
    ph-940  Terrorism and the ethics of violence
    ph-941  Punishment
    ph-942  Capital punishment
    ph-943  The ethics of technology
    ph-944  The ethics of artificial intelligence
    ph-945  Privacy and surveillance

### Political philosophy — `ph-political`

    ph-946  The scope of political philosophy
    ph-947  Political authority
    ph-948  Political obligation
    ph-949  Legitimacy
    ph-950  The state
    ph-951  Anarchism
    ph-952  Social contract theory
    ph-953  Rousseau
    ph-954  The general will
    ph-955  Liberalism
    ph-956  Liberty
    ph-957  Negative and positive liberty
    ph-958  Mill's harm principle
    ph-959  Toleration and its limits
    ph-960  Rights and human rights
    ph-961  Justice
    ph-962  John Rawls
    ph-963  A Theory of Justice
    ph-964  The original position
    ph-965  The veil of ignorance
    ph-966  The difference principle
    ph-967  Robert Nozick
    ph-968  The entitlement theory
    ph-969  Libertarianism
    ph-970  Socialism and Marxist political theory
    ph-971  Communitarianism
    ph-972  Republicanism and non-domination
    ph-973  Democracy
    ph-974  The justification of democracy
    ph-975  Equality
    ph-976  Distributive justice
    ph-977  Global justice
    ph-978  Multiculturalism and recognition
    ph-979  Feminist political philosophy
    ph-980  Ideal and non-ideal theory

### Aesthetics and the philosophy of art — `ph-aesthetics`

    ph-981  The philosophy of art
    ph-982  Defining art
    ph-983  Institutional theories of art
    ph-984  Representation in art
    ph-985  Expression in art
    ph-986  Formalism in aesthetics
    ph-987  Aesthetic experience
    ph-988  Beauty
    ph-989  Taste and aesthetic judgement
    ph-990  The sublime in aesthetics
    ph-991  Art and emotion
    ph-992  The paradox of fiction
    ph-993  The paradox of tragedy
    ph-994  Fiction and truth
    ph-995  Interpretation and the intentional fallacy
    ph-996  Artistic value
    ph-997  Art and morality
    ph-998  Forgery and authenticity
    ph-999  Music and abstraction
    ph-1000  The future of philosophy
