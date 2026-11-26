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

The padding above is right for every id but the last: the ids are `phi-001` … `phi-999`, then `phi-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`phi-148 The theory of Forms` is already an answer term; `phi-340 Whether "philosophy" is the right word
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

**`phi-340` cards the question this decision raises**, rather than settling it silently: whether
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
| Foundations, Method and Logic | What philosophy is | 20 | phi-001–020 |
|  | Argument, reasoning and fallacies | 25 | phi-021–045 |
|  | Formal logic | 30 | phi-046–075 |
|  | Philosophy of logic and mathematics | 25 | phi-076–100 |
| Ancient Mediterranean Philosophy | The Presocratics | 25 | phi-101–125 |
|  | Socrates and the sophists | 20 | phi-126–145 |
|  | Plato | 30 | phi-146–175 |
|  | Aristotle | 30 | phi-176–205 |
|  | Hellenistic and Roman philosophy | 20 | phi-206–225 |
| Indian, Chinese and Japanese Philosophy | Classical Indian philosophy | 30 | phi-226–255 |
|  | Buddhist philosophy | 30 | phi-256–285 |
|  | Chinese philosophy | 35 | phi-286–320 |
|  | Japanese and modern Asian philosophy | 20 | phi-321–340 |
| Medieval, Islamic and Jewish Philosophy | Late antiquity and Augustine | 20 | phi-341–360 |
|  | Philosophy in the Islamic world | 30 | phi-361–390 |
|  | Jewish philosophy | 15 | phi-391–405 |
|  | Scholasticism | 30 | phi-406–435 |
| Early Modern Philosophy | Renaissance and the scientific revolution | 25 | phi-436–460 |
|  | The rationalists | 30 | phi-461–490 |
|  | The empiricists | 30 | phi-491–520 |
|  | Kant | 30 | phi-521–550 |
| The Nineteenth Century and Continental Philosophy | German idealism and its critics | 25 | phi-551–575 |
|  | Marx, Kierkegaard and Nietzsche | 25 | phi-576–600 |
|  | Phenomenology and existentialism | 30 | phi-601–630 |
|  | Critical theory, feminist and decolonial philosophy | 30 | phi-631–660 |
| Analytic Philosophy | The birth of analytic philosophy | 25 | phi-661–685 |
|  | Wittgenstein | 20 | phi-686–705 |
|  | Logical positivism and its collapse | 25 | phi-706–730 |
|  | Meaning, reference and language | 25 | phi-731–755 |
| Metaphysics, Epistemology and Mind | Metaphysics | 30 | phi-756–785 |
|  | Epistemology | 30 | phi-786–815 |
|  | Philosophy of mind | 30 | phi-816–845 |
|  | Philosophy of science | 25 | phi-846–870 |
| Ethics, Politics and Aesthetics | Metaethics | 20 | phi-871–890 |
|  | Normative ethics | 30 | phi-891–920 |
|  | Applied ethics | 25 | phi-921–945 |
|  | Political philosophy | 35 | phi-946–980 |
|  | Aesthetics and the philosophy of art | 20 | phi-981–1000 |

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
apparatus is what lets a reader evaluate the rest. `phi-023` validity and `phi-024` soundness are
prerequisites for most of the collection, and a reader who cannot tell them apart will misread every
argument card in it.

**Analytic philosophy gets 95 and continental 110, and the near-parity is a decision.** English-language
teaching usually spends far more on the analytic tradition and Folio's own reading audience is
English-speaking, but a collection that mirrored that would be teaching a discipline's local
institutional history as though it were the shape of the subject. `phi-017` cards the split itself.

**Wittgenstein gets a subdeck of 20 to himself and nobody else does.** He is the only figure who
produced two bodies of work that are argued about separately, and the second one is the origin of a way
of doing philosophy that half of deck 7 is a reaction to. Plato and Aristotle get more cards, but inside
a period deck; this is the only single-person leaf in the collection.

## Six decisions this plan forced on the tree

**The systematic decks come last and the historical decks come first, rather than the other way round.**
Both orders are defensible and this one is chosen for a specific reason: `phi-788` (the Gettier problem)
is unintelligible without `phi-167` (knowledge as justified true belief), and `phi-824` (functionalism)
without `phi-469` (Cartesian dualism). The systematic decks are full of moves whose point is what they
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
that do exist (`phi-132` Socrates, `phi-146` Plato, `phi-505` Hume, `phi-521` Kant) open a run of argument
cards rather than standing alone.

**Aesthetics is 20 cards at the end of deck 9, and that is the thinnest treatment in the collection.**
Stated rather than hidden: it is a real subfield with a real literature, and 20 cards can carry the
concept of art, aesthetic experience, the two classic paradoxes and the art-and-morality question, and
not much else. If the collection is ever extended, this is where the first 30 cards should go.

**`phi-1000` is "The future of philosophy" and `ps-1000` is "Where psychology is going".** Both plans end
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
`phi-621` (existence precedes essence) so that a reader can see what it denies; write `phi-479` (God or
Nature) so that a reader can see why contemporaries called it atheism and why Spinoza denied it.

**Contemporary politics.** Deck 9 contains most of what people argue about on the internet, and
`phi-925` abortion, `phi-942` capital punishment, `phi-969` libertarianism and `phi-979` feminist political
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
scholarly dispute (`phi-133` the Socratic problem, `phi-123` the Presocratic sources problem, `phi-617`
Heidegger and National Socialism, `phi-704` the reception of Wittgenstein), where the argument about the
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
book written in fourth-century Athens; `phi-151` is the Republic as an argument about justice, and
`phi-152` to `phi-157` take that argument apart. Ten sentences on Confucius the figure in a Chinese
history deck is a different card from ten sentences on `phi-290` *ren*.

**Psychology is the closest neighbour and shares a whole subject with this one.** Philosophy of mind
(`phi-816`–`phi-845`) and psychology's own foundations (`ps-001`–`ps-045`) meet at consciousness, the
mind–body problem, free will and the self. The division: **psychology asks what is the case and
philosophy asks what would settle it.** `ps-516` Consciousness is what the science has established;
`phi-832` The hard problem is the argument that the science cannot settle it.
**One topic is deliberately carded in both collections under the same name** — `ps-518` and `phi-832` are
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

    phi-001  Philosophy
    phi-002  Value theory and the branches of philosophy
    phi-003  Metaphysics
    phi-004  Epistemology
    phi-005  Ethics
    phi-006  Logic
    phi-007  Aesthetics
    phi-008  Political philosophy
    phi-009  Aporia: the philosophical puzzle
    phi-010  Conceptual analysis
    phi-011  The thought experiment
    phi-012  Intuitions in philosophy
    phi-013  Philosophy and science
    phi-014  Philosophy and religion
    phi-015  Philosophy and common sense
    phi-016  The history of philosophy as philosophy
    phi-017  Analytic and continental philosophy
    phi-018  Philosophical method
    phi-019  Reflective equilibrium
    phi-020  What philosophical progress would look like

### Argument, reasoning and fallacies — `ph-argument`

    phi-021  Argument
    phi-022  Premises and conclusions
    phi-023  Validity
    phi-024  Soundness
    phi-025  Deduction
    phi-026  Induction
    phi-027  The problem of induction
    phi-028  Abduction
    phi-029  Inference to the best explanation
    phi-030  Necessary and sufficient conditions
    phi-031  Counterexample
    phi-032  Reductio ad absurdum
    phi-033  Begging the question
    phi-034  The straw man fallacy
    phi-035  Ad hominem
    phi-036  The genetic fallacy
    phi-037  Equivocation
    phi-038  False dilemma
    phi-039  The slippery slope argument
    phi-040  Appeal to authority
    phi-041  Circular reasoning
    phi-042  The naturalistic fallacy
    phi-043  Formal and informal fallacies
    phi-044  Paradox
    phi-045  The principle of charity

### Formal logic — `ph-logic`

    phi-046  Formal logic
    phi-047  Propositional logic
    phi-048  Truth functions
    phi-049  The truth table
    phi-050  Logical connectives: conjunction, disjunction and negation
    phi-051  The material conditional
    phi-052  The paradoxes of material implication
    phi-053  Logical equivalence
    phi-054  Natural deduction
    phi-055  The axiomatic method
    phi-056  Predicate logic
    phi-057  Quantifiers
    phi-058  Identity in logic
    phi-059  Definite descriptions
    phi-060  Syllogistic logic
    phi-061  The square of opposition
    phi-062  Modal logic
    phi-063  Possible worlds
    phi-064  Metaphysical necessity and possibility
    phi-065  Deontic logic
    phi-066  Temporal logic
    phi-067  Epistemic logic
    phi-068  Many-valued logic
    phi-069  Intuitionistic logic
    phi-070  Paraconsistent logic
    phi-071  Second-order logic
    phi-072  Soundness and completeness of a logical system
    phi-073  Gödel's incompleteness theorems
    phi-074  The Löwenheim–Skolem theorem
    phi-075  Set theory and logic

### Philosophy of logic and mathematics — `ph-philmath`

    phi-076  Philosophy of logic
    phi-077  Logical consequence
    phi-078  Logical form
    phi-079  Logical constants
    phi-080  Truth
    phi-081  The correspondence theory of truth
    phi-082  The coherence theory of truth
    phi-083  Deflationary theories of truth
    phi-084  The liar paradox
    phi-085  Tarski's theory of truth
    phi-086  Vagueness
    phi-087  The sorites paradox
    phi-088  Philosophy of mathematics
    phi-089  Mathematical Platonism
    phi-090  Logicism
    phi-091  Frege's programme
    phi-092  Russell's paradox
    phi-093  Formalism in mathematics
    phi-094  Intuitionism in mathematics
    phi-095  Fictionalism about mathematics
    phi-096  The indispensability argument
    phi-097  Mathematical proof
    phi-098  Actual and potential infinity
    phi-099  Cantor and the transfinite
    phi-100  The unreasonable effectiveness of mathematics

## Ancient Mediterranean Philosophy

### The Presocratics — `ph-presocratic`

    phi-101  Presocratic philosophy
    phi-102  The Milesian school
    phi-103  Thales
    phi-104  Anaximander
    phi-105  Anaximenes
    phi-106  The arche
    phi-107  Pythagoras
    phi-108  Pythagoreanism
    phi-109  Xenophanes
    phi-110  Heraclitus
    phi-111  Flux and the unity of opposites
    phi-112  The logos
    phi-113  Parmenides
    phi-114  The way of truth and the way of opinion
    phi-115  Zeno of Elea
    phi-116  Zeno's paradoxes
    phi-117  Empedocles
    phi-118  The four elements
    phi-119  Anaxagoras
    phi-120  Nous
    phi-121  Leucippus and Democritus
    phi-122  Ancient atomism
    phi-123  The Presocratic sources problem
    phi-124  Cosmology before philosophy
    phi-125  What the Presocratics were doing

### Socrates and the sophists — `ph-socrates`

    phi-126  The sophists
    phi-127  Protagoras
    phi-128  Man is the measure of all things
    phi-129  Gorgias
    phi-130  Nomos and physis
    phi-131  Rhetoric and philosophy
    phi-132  Socrates
    phi-133  The Socratic problem
    phi-134  The Socratic method
    phi-135  Socratic ignorance
    phi-136  The unexamined life
    phi-137  Socratic intellectualism
    phi-138  The trial of Socrates
    phi-139  The Apology
    phi-140  The Crito and the duty to obey
    phi-141  The Euthyphro dilemma
    phi-142  Definition in the early dialogues
    phi-143  The Socratic schools
    phi-144  The Cynics
    phi-145  Diogenes of Sinope

### Plato — `ph-plato`

    phi-146  Plato
    phi-147  The Platonic dialogue
    phi-148  The theory of Forms
    phi-149  Participation
    phi-150  The third man argument
    phi-151  The Republic
    phi-152  Justice in the Republic
    phi-153  The tripartite soul
    phi-154  The philosopher-king
    phi-155  The allegory of the cave
    phi-156  The divided line
    phi-157  The Form of the Good
    phi-158  The Meno
    phi-159  Recollection
    phi-160  The Meno's paradox of inquiry
    phi-161  The Phaedo
    phi-162  Arguments for the immortality of the soul
    phi-163  The Symposium
    phi-164  Platonic love
    phi-165  The Phaedrus
    phi-166  The Theaetetus
    phi-167  Knowledge as justified true belief
    phi-168  The Sophist
    phi-169  The problem of not-being
    phi-170  The Parmenides
    phi-171  The Timaeus
    phi-172  The demiurge
    phi-173  The Laws
    phi-174  The Academy
    phi-175  Plato's critique of writing and art

### Aristotle — `ph-aristotle`

    phi-176  Aristotle
    phi-177  The Aristotelian corpus
    phi-178  The categories
    phi-179  Substance
    phi-180  Hylomorphism
    phi-181  Matter and form
    phi-182  The four causes
    phi-183  Potentiality and actuality
    phi-184  Teleology in nature
    phi-185  The Physics
    phi-186  Aristotle on motion and place
    phi-187  Aristotle on time
    phi-188  The Metaphysics
    phi-189  Being qua being
    phi-190  The unmoved mover
    phi-191  The Organon
    phi-192  The syllogism
    phi-193  The Posterior Analytics
    phi-194  Scientific demonstration
    phi-195  The Nicomachean Ethics
    phi-196  Eudaimonia
    phi-197  Virtue as a mean
    phi-198  Practical wisdom
    phi-199  Akrasia
    phi-200  Friendship in Aristotle
    phi-201  The Politics
    phi-202  Man as a political animal
    phi-203  Aristotle on slavery
    phi-204  The Poetics
    phi-205  Catharsis and tragedy

### Hellenistic and Roman philosophy — `ph-hellenistic`

    phi-206  Hellenistic philosophy
    phi-207  Epicurus
    phi-208  Epicureanism
    phi-209  Epicurean atomism and the swerve
    phi-210  The Epicurean account of pleasure
    phi-211  Lucretius
    phi-212  Stoicism
    phi-213  Zeno of Citium and the early Stoa
    phi-214  Stoic physics and the logos
    phi-215  Stoic logic
    phi-216  The Stoic passions
    phi-217  Living according to nature
    phi-218  Epictetus
    phi-219  Seneca
    phi-220  Marcus Aurelius
    phi-221  Ancient scepticism
    phi-222  Pyrrho and Pyrrhonism
    phi-223  Sextus Empiricus
    phi-224  The Academic sceptics
    phi-225  Philosophy as a way of life

## Indian, Chinese and Japanese Philosophy

### Classical Indian philosophy — `ph-indian`

    phi-226  Indian philosophy
    phi-227  The Vedas
    phi-228  The Upanishads
    phi-229  Brahman
    phi-230  Atman
    phi-231  Karma
    phi-232  Samsara
    phi-233  Moksha
    phi-234  The six orthodox schools
    phi-235  Samkhya
    phi-236  Purusha and prakriti
    phi-237  Yoga philosophy
    phi-238  Nyaya
    phi-239  Indian theories of inference
    phi-240  Vaisheshika
    phi-241  Indian atomism
    phi-242  Mimamsa
    phi-243  Vedanta
    phi-244  Advaita Vedanta
    phi-245  Shankara
    phi-246  Maya
    phi-247  Vishishtadvaita
    phi-248  Ramanuja
    phi-249  Dvaita Vedanta
    phi-250  The Bhagavad Gita
    phi-251  Dharma
    phi-252  Jain philosophy
    phi-253  Anekantavada
    phi-254  Charvaka materialism
    phi-255  The pramanas

### Buddhist philosophy — `ph-buddhist`

    phi-256  Buddhist philosophy
    phi-257  The Buddha
    phi-258  The Four Noble Truths
    phi-259  Dukkha
    phi-260  The Eightfold Path
    phi-261  Anatta
    phi-262  Anicca
    phi-263  Dependent origination
    phi-264  Nirvana
    phi-265  The five aggregates
    phi-266  The Abhidharma
    phi-267  Theravada philosophy
    phi-268  Mahayana philosophy
    phi-269  Emptiness
    phi-270  Nagarjuna
    phi-271  The Madhyamaka
    phi-272  The two truths doctrine
    phi-273  The tetralemma
    phi-274  Yogacara
    phi-275  Consciousness-only
    phi-276  Vasubandhu
    phi-277  Buddhist logic and epistemology
    phi-278  Dignaga and Dharmakirti
    phi-279  Buddhist ethics
    phi-280  Compassion in Buddhist thought
    phi-281  Buddhist philosophy of mind
    phi-282  The Buddhist no-self in modern philosophy
    phi-283  Chan and Zen philosophy
    phi-284  Tibetan Buddhist philosophy
    phi-285  The Buddhist–Hindu debates

### Chinese philosophy — `ph-chinese`

    phi-286  Chinese philosophy
    phi-287  The Hundred Schools of Thought
    phi-288  Confucius
    phi-289  The Analects
    phi-290  Ren
    phi-291  Li in Confucian thought
    phi-292  The junzi
    phi-293  The Five Relationships
    phi-294  The rectification of names
    phi-295  Mencius
    phi-296  Human nature is good
    phi-297  Xunzi
    phi-298  Human nature is bad
    phi-299  Daoism
    phi-300  Laozi
    phi-301  The Dao De Jing
    phi-302  The Dao
    phi-303  Wu wei
    phi-304  Zhuangzi
    phi-305  The butterfly dream
    phi-306  Mohism
    phi-307  Universal love
    phi-308  Mohist logic
    phi-309  Legalism
    phi-310  Han Feizi
    phi-311  The School of Names
    phi-312  Gongsun Long and the white horse
    phi-313  Yin and yang
    phi-314  The Book of Changes
    phi-315  Chinese Buddhism
    phi-316  Neo-Confucianism
    phi-317  Zhu Xi
    phi-318  Principle and material force
    phi-319  Wang Yangming
    phi-320  The unity of knowledge and action

### Japanese and modern Asian philosophy — `ph-japan`

    phi-321  Japanese philosophy
    phi-322  Shinto thought
    phi-323  Japanese Buddhist philosophy
    phi-324  Dogen
    phi-325  Zen and the philosophy of practice
    phi-326  Bushido as a philosophical text
    phi-327  The Kyoto School
    phi-328  Nishida Kitaro
    phi-329  Absolute nothingness
    phi-330  Watsuji Tetsuro
    phi-331  Modern Indian philosophy
    phi-332  Vivekananda and neo-Vedanta
    phi-333  Aurobindo
    phi-334  Gandhi's philosophy of nonviolence
    phi-335  Ambedkar's critique of caste
    phi-336  New Confucianism
    phi-337  Chinese Marxism as philosophy
    phi-338  Comparative philosophy
    phi-339  Translating philosophical terms across traditions
    phi-340  Whether "philosophy" is the right word for these traditions

## Medieval, Islamic and Jewish Philosophy

### Late antiquity and Augustine — `ph-lateantique`

    phi-341  Late antique philosophy
    phi-342  Middle Platonism
    phi-343  Neoplatonism
    phi-344  Plotinus
    phi-345  The One
    phi-346  Emanation
    phi-347  Porphyry
    phi-348  Proclus
    phi-349  The closing of the Academy
    phi-350  Early Christian philosophy
    phi-351  Philosophy and revelation
    phi-352  Augustine of Hippo
    phi-353  The Confessions
    phi-354  Augustine on time
    phi-355  Augustine on the will
    phi-356  Original sin and grace
    phi-357  The City of God
    phi-358  Augustine on evil
    phi-359  Boethius
    phi-360  The Consolation of Philosophy

### Philosophy in the Islamic world — `ph-islamic`

    phi-361  Philosophy in the Islamic world
    phi-362  The translation movement
    phi-363  Falsafa
    phi-364  Kalam
    phi-365  The Mu'tazila
    phi-366  The Ash'arites
    phi-367  Al-Kindi
    phi-368  Al-Razi
    phi-369  Al-Farabi
    phi-370  The virtuous city
    phi-371  Avicenna
    phi-372  The flying man argument
    phi-373  Avicenna on essence and existence
    phi-374  The necessary existent
    phi-375  Al-Ghazali
    phi-376  The Incoherence of the Philosophers
    phi-377  Al-Ghazali on causation
    phi-378  Averroes
    phi-379  The Incoherence of the Incoherence
    phi-380  Averroes on religion and philosophy
    phi-381  The unity of the intellect
    phi-382  Ibn Tufayl and the self-taught philosopher
    phi-383  Suhrawardi and illuminationism
    phi-384  Mulla Sadra
    phi-385  Sufi philosophy
    phi-386  Ibn Arabi
    phi-387  Ibn Khaldun
    phi-388  The transmission of Aristotle to the Latin West
    phi-389  Islamic philosophy after Averroes
    phi-390  Modern Islamic philosophy

### Jewish philosophy — `ph-jewish`

    phi-391  Jewish philosophy
    phi-392  Philo of Alexandria
    phi-393  Saadia Gaon
    phi-394  Judah Halevi
    phi-395  Maimonides
    phi-396  The Guide for the Perplexed
    phi-397  Negative theology
    phi-398  Maimonides on prophecy
    phi-399  Gersonides
    phi-400  Hasdai Crescas
    phi-401  Jewish Aristotelianism and its critics
    phi-402  Kabbalah as philosophy
    phi-403  Spinoza's Jewish context
    phi-404  Hermann Cohen
    phi-405  Levinas and the ethics of the other

### Scholasticism — `ph-scholastic`

    phi-406  Scholasticism
    phi-407  The medieval university
    phi-408  The problem of universals
    phi-409  Realism about universals
    phi-410  Nominalism
    phi-411  Conceptualism
    phi-412  Anselm of Canterbury
    phi-413  The ontological argument
    phi-414  Faith seeking understanding
    phi-415  Peter Abelard
    phi-416  Abelard on intention and ethics
    phi-417  Thomas Aquinas
    phi-418  The Summa Theologiae
    phi-419  The five ways
    phi-420  Aquinas on analogy
    phi-421  Natural law
    phi-422  Aquinas on the soul
    phi-423  The Condemnations of 1277
    phi-424  Bonaventure
    phi-425  Duns Scotus
    phi-426  Haecceity
    phi-427  The univocity of being
    phi-428  William of Ockham
    phi-429  Ockham's razor
    phi-430  Ockham's nominalism
    phi-431  Divine command and voluntarism
    phi-432  The Oxford Calculators
    phi-433  Buridan and the ass
    phi-434  Late scholastic logic
    phi-435  The end of scholasticism

## Early Modern Philosophy

### Renaissance and the scientific revolution — `ph-renaissance`

    phi-436  Renaissance philosophy
    phi-437  Humanism
    phi-438  The recovery of ancient texts
    phi-439  Pico della Mirandola
    phi-440  Machiavelli
    phi-441  The Prince and political realism
    phi-442  Montaigne
    phi-443  The essay as philosophy
    phi-444  Renaissance scepticism
    phi-445  Giordano Bruno
    phi-446  The scientific revolution
    phi-447  Copernicus and the new cosmology
    phi-448  Galileo
    phi-449  The book of nature written in mathematics
    phi-450  Francis Bacon
    phi-451  The idols of the mind
    phi-452  Baconian induction
    phi-453  Thomas Hobbes
    phi-454  The state of nature
    phi-455  Leviathan
    phi-456  Hobbes on the social contract
    phi-457  Hobbesian materialism
    phi-458  The mechanical philosophy
    phi-459  Primary and secondary qualities
    phi-460  The new science and the soul

### The rationalists — `ph-rationalists`

    phi-461  Rationalism
    phi-462  René Descartes
    phi-463  The Meditations on First Philosophy
    phi-464  Methodical doubt
    phi-465  The evil demon
    phi-466  The cogito
    phi-467  The Cartesian circle
    phi-468  Descartes's proofs of God
    phi-469  Cartesian dualism
    phi-470  The mind–body problem in Descartes
    phi-471  The pineal gland
    phi-472  Cartesian science
    phi-473  Elisabeth of Bohemia's objection
    phi-474  Occasionalism
    phi-475  Malebranche
    phi-476  Baruch Spinoza
    phi-477  The Ethics
    phi-478  Substance monism
    phi-479  God or Nature
    phi-480  Spinoza on the attributes
    phi-481  Spinoza on freedom and necessity
    phi-482  The Theological-Political Treatise
    phi-483  Gottfried Wilhelm Leibniz
    phi-484  The monadology
    phi-485  Pre-established harmony
    phi-486  The principle of sufficient reason
    phi-487  The identity of indiscernibles
    phi-488  The best of all possible worlds
    phi-489  Leibniz on necessity and contingency
    phi-490  Innate knowledge

### The empiricists — `ph-empiricists`

    phi-491  Empiricism
    phi-492  John Locke
    phi-493  An Essay Concerning Human Understanding
    phi-494  The tabula rasa
    phi-495  Locke's theory of ideas
    phi-496  Locke on personal identity
    phi-497  Locke on substance
    phi-498  Locke's Two Treatises
    phi-499  Locke on property
    phi-500  Toleration
    phi-501  George Berkeley
    phi-502  Idealism
    phi-503  To be is to be perceived
    phi-504  Berkeley's attack on abstract ideas
    phi-505  David Hume
    phi-506  A Treatise of Human Nature
    phi-507  Impressions and ideas
    phi-508  Hume on causation
    phi-509  Constant conjunction
    phi-510  Hume's fork
    phi-511  Hume on the self
    phi-512  Hume on miracles
    phi-513  Hume on induction
    phi-514  Hume's moral sentimentalism
    phi-515  Is and ought
    phi-516  The Dialogues Concerning Natural Religion
    phi-517  The design argument and its critics
    phi-518  Thomas Reid and common sense
    phi-519  Adam Smith's moral philosophy
    phi-520  The Scottish Enlightenment

### Kant — `ph-kant`

    phi-521  Immanuel Kant
    phi-522  The critical philosophy
    phi-523  The Critique of Pure Reason
    phi-524  The Copernican turn
    phi-525  Analytic and synthetic judgements
    phi-526  A priori and a posteriori
    phi-527  Synthetic a priori knowledge
    phi-528  The transcendental aesthetic
    phi-529  Space and time as forms of intuition
    phi-530  The categories of the understanding
    phi-531  The transcendental deduction
    phi-532  Phenomena and noumena
    phi-533  The thing in itself
    phi-534  The paralogisms
    phi-535  The antinomies of pure reason
    phi-536  Kant's critique of the ontological argument
    phi-537  The Groundwork of the Metaphysics of Morals
    phi-538  The good will
    phi-539  The categorical imperative
    phi-540  The formula of universal law
    phi-541  The formula of humanity
    phi-542  Autonomy
    phi-543  The kingdom of ends
    phi-544  The Critique of Practical Reason
    phi-545  The postulates of practical reason
    phi-546  The Critique of the Power of Judgement
    phi-547  The judgement of taste
    phi-548  The sublime
    phi-549  Kant's political writings
    phi-550  Perpetual peace

## The Nineteenth Century and Continental Philosophy

### German idealism and its critics — `ph-idealism`

    phi-551  German idealism
    phi-552  The reception of Kant
    phi-553  Fichte
    phi-554  The I and the not-I
    phi-555  Schelling
    phi-556  Naturphilosophie
    phi-557  G. W. F. Hegel
    phi-558  The Phenomenology of Spirit
    phi-559  Dialectic
    phi-560  The master–slave dialectic
    phi-561  Spirit
    phi-562  Hegel's Logic
    phi-563  The Philosophy of Right
    phi-564  Hegel's philosophy of history
    phi-565  The end of history
    phi-566  The Young Hegelians
    phi-567  Feuerbach
    phi-568  Religion as projection
    phi-569  Arthur Schopenhauer
    phi-570  The World as Will and Representation
    phi-571  The will
    phi-572  Schopenhauer's pessimism
    phi-573  Romanticism and philosophy
    phi-574  Hermeneutics before Heidegger
    phi-575  Historicism

### Marx, Kierkegaard and Nietzsche — `ph-critics`

    phi-576  Karl Marx
    phi-577  Historical materialism
    phi-578  Alienation
    phi-579  The critique of ideology
    phi-580  Base and superstructure
    phi-581  Class struggle
    phi-582  Marx's critique of political economy
    phi-583  Commodity fetishism
    phi-584  The Communist Manifesto
    phi-585  Marx on freedom
    phi-586  Søren Kierkegaard
    phi-587  The single individual
    phi-588  The stages of life's way
    phi-589  The leap of faith
    phi-590  Fear and Trembling
    phi-591  Anxiety and despair
    phi-592  Kierkegaard's critique of Hegel
    phi-593  Friedrich Nietzsche
    phi-594  The death of God
    phi-595  The genealogical method
    phi-596  Master and slave morality
    phi-597  The will to power
    phi-598  Eternal recurrence
    phi-599  The Übermensch
    phi-600  Nietzsche's perspectivism

### Phenomenology and existentialism — `ph-phenomenology`

    phi-601  Phenomenology
    phi-602  Franz Brentano and intentionality
    phi-603  Edmund Husserl
    phi-604  The phenomenological reduction
    phi-605  The natural attitude
    phi-606  The life-world
    phi-607  Eidetic intuition
    phi-608  Martin Heidegger
    phi-609  Being and Time
    phi-610  Dasein
    phi-611  Being-in-the-world
    phi-612  Ready-to-hand and present-at-hand
    phi-613  Authenticity
    phi-614  Being-towards-death
    phi-615  The question of being
    phi-616  Heidegger's later thought
    phi-617  Heidegger and National Socialism
    phi-618  Existentialism
    phi-619  Jean-Paul Sartre
    phi-620  Being and Nothingness
    phi-621  Existence precedes essence
    phi-622  Radical freedom
    phi-623  Bad faith
    phi-624  Simone de Beauvoir
    phi-625  The Second Sex
    phi-626  One is not born a woman
    phi-627  Albert Camus
    phi-628  The absurd
    phi-629  Maurice Merleau-Ponty
    phi-630  The phenomenology of the body

### Critical theory, feminist and decolonial philosophy — `ph-critical`

    phi-631  Critical theory
    phi-632  The Frankfurt School
    phi-633  Adorno and Horkheimer
    phi-634  Dialectic of Enlightenment
    phi-635  The culture industry
    phi-636  Herbert Marcuse
    phi-637  Jürgen Habermas
    phi-638  Communicative action
    phi-639  The public sphere
    phi-640  Structuralism
    phi-641  Saussure and the sign
    phi-642  Claude Lévi-Strauss
    phi-643  Post-structuralism
    phi-644  Michel Foucault
    phi-645  Power/knowledge
    phi-646  Discipline and punishment
    phi-647  Biopolitics
    phi-648  Jacques Derrida
    phi-649  Deconstruction
    phi-650  Différance
    phi-651  Gilles Deleuze
    phi-652  Feminist philosophy
    phi-653  Feminist epistemology
    phi-654  Standpoint theory
    phi-655  Gender performativity
    phi-656  Africana philosophy
    phi-657  Double consciousness
    phi-658  Frantz Fanon
    phi-659  Decolonial philosophy
    phi-660  Latin American philosophy of liberation

## Analytic Philosophy

### The birth of analytic philosophy — `ph-analytic-birth`

    phi-661  Analytic philosophy
    phi-662  The revolt against idealism
    phi-663  British idealism
    phi-664  G. E. Moore
    phi-665  Moore's defence of common sense
    phi-666  The open question argument
    phi-667  Bertrand Russell
    phi-668  The theory of descriptions
    phi-669  Logical atomism
    phi-670  Knowledge by acquaintance and by description
    phi-671  Principia Mathematica
    phi-672  Gottlob Frege
    phi-673  The Begriffsschrift
    phi-674  Sense and reference
    phi-675  The context principle
    phi-676  Frege on concept and object
    phi-677  The linguistic turn
    phi-678  Analysis as a philosophical method
    phi-679  The paradox of analysis
    phi-680  Logic and ordinary language
    phi-681  Alfred North Whitehead
    phi-682  Process philosophy
    phi-683  Frank Ramsey
    phi-684  C. S. Peirce and pragmatism
    phi-685  William James on truth

### Wittgenstein — `ph-wittgenstein`

    phi-686  Ludwig Wittgenstein
    phi-687  The Tractatus Logico-Philosophicus
    phi-688  The picture theory of meaning
    phi-689  Saying and showing
    phi-690  The limits of language
    phi-691  Wittgenstein's turn
    phi-692  Philosophical Investigations
    phi-693  Meaning as use
    phi-694  Language games
    phi-695  Family resemblance
    phi-696  The private language argument
    phi-697  Rule-following
    phi-698  The beetle in the box
    phi-699  Forms of life
    phi-700  Philosophy as therapy
    phi-701  On Certainty
    phi-702  Hinge propositions
    phi-703  Aspect seeing
    phi-704  The reception of Wittgenstein
    phi-705  Kripke's Wittgenstein

### Logical positivism and its collapse — `ph-positivism`

    phi-706  Logical positivism
    phi-707  The Vienna Circle
    phi-708  The verification principle
    phi-709  The elimination of metaphysics
    phi-710  Protocol sentences
    phi-711  Rudolf Carnap
    phi-712  The analytic–synthetic distinction
    phi-713  Neurath's boat
    phi-714  A. J. Ayer
    phi-715  Language, Truth and Logic
    phi-716  Emotivism
    phi-717  Karl Popper
    phi-718  Falsifiability
    phi-719  The demarcation problem
    phi-720  W. V. O. Quine
    phi-721  Two Dogmas of Empiricism
    phi-722  The web of belief
    phi-723  Ontological relativity
    phi-724  Indeterminacy of translation
    phi-725  Naturalised epistemology
    phi-726  Wilfrid Sellars
    phi-727  The myth of the given
    phi-728  Ordinary language philosophy
    phi-729  J. L. Austin
    phi-730  The ghost in the machine

### Meaning, reference and language — `ph-language`

    phi-731  Philosophy of language
    phi-732  Theories of meaning
    phi-733  Reference
    phi-734  Descriptivism about names
    phi-735  Saul Kripke
    phi-736  Naming and Necessity
    phi-737  Rigid designators
    phi-738  The causal theory of reference
    phi-739  Natural kind terms
    phi-740  Twin Earth
    phi-741  Semantic externalism
    phi-742  Sense, force and content
    phi-743  Truth-conditional semantics
    phi-744  Donald Davidson
    phi-745  Radical interpretation
    phi-746  The principle of charity in interpretation
    phi-747  Implicature
    phi-748  Pragmatics
    phi-749  Speech act theory
    phi-750  Metaphor
    phi-751  Context and indexicals
    phi-752  Compositionality
    phi-753  Linguistic relativity in philosophy
    phi-754  Conceptual engineering
    phi-755  Slurs and pejoratives

## Metaphysics, Epistemology and Mind

### Metaphysics — `ph-metaphysics`

    phi-756  Contemporary metaphysics
    phi-757  Ontology
    phi-758  Existence
    phi-759  Universals and particulars
    phi-760  Properties
    phi-761  Tropes
    phi-762  Substance in modern metaphysics
    phi-763  Essence and accident
    phi-764  Modality
    phi-765  Possible worlds realism
    phi-766  Counterparts
    phi-767  Identity
    phi-768  Identity over time
    phi-769  Personal identity
    phi-770  The psychological continuity theory
    phi-771  The bodily criterion
    phi-772  What matters in survival
    phi-773  The ship of Theseus
    phi-774  Mereology
    phi-775  The problem of the many
    phi-776  Causation
    phi-777  Regularity and counterfactual theories of causation
    phi-778  Time
    phi-779  The A-series and the B-series
    phi-780  Presentism and eternalism
    phi-781  The passage of time
    phi-782  Free will
    phi-783  Determinism
    phi-784  Compatibilism
    phi-785  Moral responsibility and alternative possibilities

### Epistemology — `ph-epistemology`

    phi-786  Knowledge
    phi-787  The tripartite analysis of knowledge
    phi-788  The Gettier problem
    phi-789  Responses to Gettier
    phi-790  Justification
    phi-791  Foundationalism
    phi-792  Coherentism
    phi-793  Infinitism
    phi-794  Internalism and externalism about justification
    phi-795  Reliabilism
    phi-796  Virtue epistemology
    phi-797  Belief
    phi-798  Degrees of belief
    phi-799  Bayesian epistemology
    phi-800  Evidence
    phi-801  Testimony
    phi-802  Memory as a source of knowledge
    phi-803  Perception as a source of knowledge
    phi-804  The a priori
    phi-805  Scepticism
    phi-806  The problem of the external world
    phi-807  The brain in a vat
    phi-808  Closure and scepticism
    phi-809  Contextualism about knowledge
    phi-810  Epistemic relativism
    phi-811  Peer disagreement
    phi-812  Social epistemology
    phi-813  Epistemic injustice
    phi-814  Expertise and epistemic autonomy
    phi-815  Understanding and wisdom

### Philosophy of mind — `ph-mind`

    phi-816  Philosophy of mind
    phi-817  The mind–body problem
    phi-818  Substance dualism
    phi-819  Property dualism
    phi-820  Physicalism
    phi-821  Behaviourism in philosophy
    phi-822  The identity theory
    phi-823  Multiple realisability
    phi-824  Functionalism
    phi-825  The computational theory of mind
    phi-826  The Chinese room argument
    phi-827  Consciousness
    phi-828  Qualia
    phi-829  The knowledge argument
    phi-830  What is it like to be a bat
    phi-831  The explanatory gap
    phi-832  The hard problem of consciousness
    phi-833  Philosophical zombies
    phi-834  Higher-order theories of consciousness
    phi-835  Global workspace and integrated information
    phi-836  Intentionality
    phi-837  Mental content
    phi-838  Internalism and externalism about content
    phi-839  The extended mind
    phi-840  Embodied cognition
    phi-841  Mental causation
    phi-842  Epiphenomenalism
    phi-843  Panpsychism
    phi-844  Animal minds
    phi-845  Machine consciousness

### Philosophy of science — `ph-science`

    phi-846  Philosophy of science
    phi-847  Scientific explanation
    phi-848  The deductive-nomological model
    phi-849  Laws of nature
    phi-850  Confirmation
    phi-851  The raven paradox
    phi-852  The new riddle of induction
    phi-853  Underdetermination
    phi-854  The Duhem–Quine thesis
    phi-855  Scientific realism
    phi-856  Instrumentalism
    phi-857  The no-miracles argument
    phi-858  The pessimistic meta-induction
    phi-859  Thomas Kuhn
    phi-860  Paradigms and scientific revolutions
    phi-861  Incommensurability
    phi-862  Research programmes
    phi-863  Paul Feyerabend
    phi-864  Values in science
    phi-865  Models and idealisation
    phi-866  Reduction and emergence
    phi-867  Philosophy of biology
    phi-868  Philosophy of physics
    phi-869  Probability and chance
    phi-870  Causal inference in science

## Ethics, Politics and Aesthetics

### Metaethics — `ph-metaethics`

    phi-871  Metaethics
    phi-872  Moral realism
    phi-873  Moral anti-realism
    phi-874  Moral relativism
    phi-875  Error theory
    phi-876  Expressivism
    phi-877  Quasi-realism
    phi-878  Moral naturalism
    phi-879  Non-naturalism
    phi-880  Moral intuitionism
    phi-881  Moral motivation
    phi-882  Internalism and externalism about moral judgement
    phi-883  Reasons for action
    phi-884  Moral epistemology
    phi-885  Moral disagreement
    phi-886  Moral luck
    phi-887  Thick and thin ethical concepts
    phi-888  Supervenience in ethics
    phi-889  The fact–value distinction
    phi-890  Evolutionary debunking arguments

### Normative ethics — `ph-normative`

    phi-891  Normative ethics
    phi-892  Consequentialism
    phi-893  Utilitarianism
    phi-894  Jeremy Bentham
    phi-895  The felicific calculus
    phi-896  John Stuart Mill
    phi-897  Higher and lower pleasures
    phi-898  Act and rule utilitarianism
    phi-899  Objections to utilitarianism
    phi-900  Deontology
    phi-901  Duty
    phi-902  Rights
    phi-903  The doctrine of double effect
    phi-904  Agent-relative and agent-neutral reasons
    phi-905  Virtue ethics
    phi-906  The revival of virtue ethics
    phi-907  Character and habituation
    phi-908  The ethics of care
    phi-909  Contractualism
    phi-910  What we owe to each other
    phi-911  Moral status
    phi-912  The trolley problem
    phi-913  Doing and allowing
    phi-914  Supererogation
    phi-915  Moral dilemmas
    phi-916  Partiality and impartiality
    phi-917  Well-being
    phi-918  Hedonism about well-being
    phi-919  Desire satisfaction and objective list theories
    phi-920  The meaning of life

### Applied ethics — `ph-applied`

    phi-921  Applied ethics
    phi-922  Bioethics
    phi-923  Autonomy and informed consent
    phi-924  Euthanasia
    phi-925  Abortion
    phi-926  The ethics of reproduction
    phi-927  Genetic enhancement
    phi-928  Animal ethics
    phi-929  Animal liberation
    phi-930  Environmental ethics
    phi-931  Climate ethics
    phi-932  Future generations
    phi-933  The non-identity problem
    phi-934  Population ethics
    phi-935  The repugnant conclusion
    phi-936  Business ethics
    phi-937  The ethics of war
    phi-938  Just war theory
    phi-939  Pacifism
    phi-940  Terrorism and the ethics of violence
    phi-941  Punishment
    phi-942  Capital punishment
    phi-943  The ethics of technology
    phi-944  The ethics of artificial intelligence
    phi-945  Privacy and surveillance

### Political philosophy — `ph-political`

    phi-946  The scope of political philosophy
    phi-947  Political authority
    phi-948  Political obligation
    phi-949  Legitimacy
    phi-950  The state
    phi-951  Anarchism
    phi-952  Social contract theory
    phi-953  Rousseau
    phi-954  The general will
    phi-955  Liberalism
    phi-956  Liberty
    phi-957  Negative and positive liberty
    phi-958  Mill's harm principle
    phi-959  Toleration and its limits
    phi-960  Rights and human rights
    phi-961  Justice
    phi-962  John Rawls
    phi-963  A Theory of Justice
    phi-964  The original position
    phi-965  The veil of ignorance
    phi-966  The difference principle
    phi-967  Robert Nozick
    phi-968  The entitlement theory
    phi-969  Libertarianism
    phi-970  Socialism and Marxist political theory
    phi-971  Communitarianism
    phi-972  Republicanism and non-domination
    phi-973  Democracy
    phi-974  The justification of democracy
    phi-975  Equality
    phi-976  Distributive justice
    phi-977  Global justice
    phi-978  Multiculturalism and recognition
    phi-979  Feminist political philosophy
    phi-980  Ideal and non-ideal theory

### Aesthetics and the philosophy of art — `ph-aesthetics`

    phi-981  The philosophy of art
    phi-982  Defining art
    phi-983  Institutional theories of art
    phi-984  Representation in art
    phi-985  Expression in art
    phi-986  Formalism in aesthetics
    phi-987  Aesthetic experience
    phi-988  Beauty
    phi-989  Taste and aesthetic judgement
    phi-990  The sublime in aesthetics
    phi-991  Art and emotion
    phi-992  The paradox of fiction
    phi-993  The paradox of tragedy
    phi-994  Fiction and truth
    phi-995  Interpretation and the intentional fallacy
    phi-996  Artistic value
    phi-997  Art and morality
    phi-998  Forgery and authenticity
    phi-999  Music and abstraction
   phi-1000  The future of philosophy
