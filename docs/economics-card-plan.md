# Economics — a 1000-card running order

The plan for `econ`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twenty-third of these and the seventh that is not a history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `ec-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='ec-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `ec-001` … `ec-999`, then `ec-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`ec-192 Externalities` is already an answer term; `ec-689 Is growth over` is an open argument to
describe, and the card's actual answer — the word that gets blanked — is chosen while writing it, from
what the sources will support.

Where the research says the line is wrong, **change the line here in the same commit as the card**, and
say so. The house rule stands: never invent a date, a name or a definition.

## Is there a thousand cards in this?

Yes, and the reason is worth stating because it decides the shape of the collection. **Economics is not
one body of settled knowledge with a periphery of applications; it is a method applied to almost
everything people do, and a set of live arguments about whether the method works.** Both halves have to
be carded, or the reader gets a textbook.

**Roughly 560 cards are the standard apparatus** — the four decks from *Microeconomics* through
*Trade and the World Economy* — and they are the part a reader can check against any introductory
course. **About 230 are the arguments**: the history of thought (120), the discipline and its critics
(25), the methods and what they can support (30), and the scattered cards that state what a model
assumes. **The remaining 210 are the subjects economics is actually used on** — growth, development,
inequality, labour, the environment.

**Where the padding risk is**, so it can be watched: the two policy decks (5 and 6) and the taxation
subdeck, where a card can restate a definition and teach nothing. **A policy instrument earns its slot
by what it trades off**, not by existing. *A tariff is a tax on imports* is a caption; what a tariff
does to prices, to whom, and who gains is a card.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue, its `COLLECTION_ICON` row and its `COLLECTION_SECTION` row all ship with the file.

**The id is `econ` and the card prefix is `ec-`**, free of every existing prefix and no prefix of any of
them. The deck ids are also `ec-…`.

**It goes in the `Science` section, on the Psychology precedent, and that deserves a sentence.**
Psychology — a social and behavioural science — is already filed under Science, and economics is the
same kind of subject, so it joins it there and `COLLECTION_SECTIONS` is unchanged. **The alternative
was a new "Social Sciences" section, and it was refused because it would be incoherent while
Psychology stayed under Science**, and moving Psychology is a change to a live collection nobody asked
for. **If a third social science ever lands — sociology, anthropology, politics as a subject rather
than as a course — the right move is a Social Sciences section taking Psychology and Economics
together**, and that is a stated future rather than a silent oddity.

### The hue: `#008C96`, a deep cyan-teal — chosen on measurement, and named for what it is

**Economics has no canonical colour, and the plan says so rather than inventing one.** The two that get
reached for are money-green and coin-gold, and those are **the two most crowded quarters on this
shelf**: the green family already holds Biology's forest, both Geography greens, the Italian deck and
the Portuguese deck, and its best free candidate scores **20.1** with three neighbours inside 20.3; the
brass-gold band tops out at **19.7** against Dinosaurs' ochre and World History's sepia.

**The one genuinely specific association fails on Korea's own rule.** The *Financial Times* salmon is
the colour a reader actually associates with economics — and FT pink is very pale (about `#FFF1E5`),
far above the contrast floor a banner needs, so what would ship is a **deepened** salmon that is not FT
pink at all. That is exactly the Korea note's refusal ("the versions that DO score are not the colour
they are named after"). Measured anyway, the best salmon candidate scores **20.3 with three neighbours
inside 0.4 of each other** — Psychology's plum, Japan's kuwazome and the Mandarin deck — which is a
crowded neighbourhood whatever the headline number says.

So the hue is chosen on **separation and density** and named for what it is. `#008C96` stands **21.1
from Egypt's malachite, 22.0 from Greece's Aegean and 23.6 from Philosophy's petrol**, against a median
nearest-neighbour distance of 20.7 across the 29 hues now on the shelf. L 53, chroma 31 (below the
shelf's median of 44, so inside the muted register), **4.0:1 against white** — the same as Politics:
East Asia's and inside the shelf's 3.7–10.4 range.

**DENSITY WAS MEASURED AS WELL AS DISTANCE, WHICH IS NEW HERE AND WORTH KEEPING.** A nearest-neighbour
figure says nothing about how many hues are just beyond it, and the shelf is now full enough that it
matters: counting hues within 30 of a candidate, this one has **4**, against Philosophy's 5,
Astronomy's 6 and France's 7. It is a less crowded neighbourhood than three hues already shipped.

**IT SHARES A HUE ANGLE WITH PHILOSOPHY'S PETROL AND IS 23.6 AWAY, WHICH IS THE POINT.** Both sit at
hue 208; petrol is L 32 / chroma 20 and this is L 53 / chroma 31. That is Biology's argument for a
fifth green, in a different family: **the separation is bought by lightness**, and the shelf gains the
light end of a band it only had the dark end of.

**The standing note in `COLL_THEME` holds and was not re-tested.** The magenta around `#c057b1` came
top of the unconstrained sweep again, at 26.5; it has now been measured and rejected **six** times. The
olive-brass beside it was rejected for the fifth. **Neither should be measured again.**

### The icon: a new symbol, `cross`

**A supply-and-demand diagram** — two curves crossing inside an L-shaped axis. It is the Marshallian
cross, which is the one image the subject has made entirely its own: nothing else on this shelf is a
chart, and a reader who has met one economics lesson recognises it.

**`coin` already exists and was refused.** It is unclaimed by any collection, so reuse was available —
but a coin says *money*, and money is one deck of nine here. The mark should say what the collection
is about, and this collection is about choice under scarcity rather than about currency.

**The collision is reading as a bare X, and the axis is the whole of what prevents it** — measured
rather than assumed: rendered without the L, the two curves are simply a saltire at every size.
**Keep the axis.** The **curvature is a weaker claim than it looks**, and the render said so: a
straight-line variant reads almost identically below about 28px, and the curve only becomes visible at
40px and up. It is kept because it is what makes the mark a supply-and-demand diagram rather than a
generic X-in-axes *where it can be seen* — not because it rescues the small sizes.

**Both the hue and the icon were rendered and looked at**, at 20, 24, 28, 40 and 64px on dark ground
and on light, beside the marks nearest them, and the hue as a banner and as its 20% wash beside its
neighbours.

## What this collection is about, and the six scope decisions

**It is economics as a discipline: what it claims, how it argues, what it is used for, and where it is
contested.** The ninth deck is 110 cards on behaviour, the environment, method and the profession
itself, and the eighth is 120 on the history of the arguments, because in this subject **the
disagreements are not a footnote to the knowledge — they are a large part of what there is to know.**

**First: economics is contested, and the collection cards the contest rather than picking a side.**
This is the sharpest difference from Biology or Astronomy. There are live schools with incompatible
frameworks, and a great deal of accessible economic writing presents one of them as simply the truth.
`ec-017` *Why economists disagree* and `ec-018` *Schools of economic thought* open the collection for
this reason, and `ec-303` to `ec-307` deliberately card **four accounts of the business cycle side by
side** — real business cycle, Keynesian, monetarist, Austrian, plus Minsky — as four accounts. **A card
may say the question is open. It may not settle a question the literature has not.**

**Second: a model is carded with what it assumes and what it is for.** Perfect competition, *homo
economicus*, rational expectations, the Coase theorem and the efficient market hypothesis are tools,
not descriptions, and each is the sort of thing a reader meets as a claim about the world. `ec-046`,
`ec-168`, `ec-169`, `ec-199`, `ec-139`, `ec-140` and `ec-893` exist to make that explicit, and every
model card inherits it. **`ec-169` is titled *Why perfect competition matters as a benchmark*** — not
*Perfect competition in the real world*, because it is not in the real world and the card's job is to
say what a benchmark is for.

**Third: positive and normative are distinguished, repeatedly, because this is where economics slides
most.** `ec-006`, `ec-007`, `ec-040` *Why efficiency is not the same as good*, `ec-070`, `ec-073` *What
Pareto efficiency ignores* and `ec-077` are the spine. **Efficiency is not welfare and a Pareto
improvement is not fairness**; a card that uses "efficient" as praise has made an argument it did not
make.

**Fourth: NOTHING IN THIS COLLECTION IS INVESTMENT ADVICE, and that is a rule rather than a
disposition.** Four subdecks describe assets, prices, bubbles and returns, and that material is one
careless sentence away from reading as a recommendation. **No card says what will happen to a price,
what a reader should buy or hold, or that any asset class is a good investment.** `ec-438` and `ec-439`
card the efficient market hypothesis **with the evidence for and against it**; `ec-444` and `ec-445`
card bubbles and then say plainly that they are hard to identify in advance, which is the honest
finding and also the safe one. `ec-374` cryptocurrencies is carded as a monetary and technical subject,
not as an asset. **This risk exists in no other collection on the shelf.**

**Fifth: the evidential standing of a finding is part of the finding.** This is the Psychology plan's
rule in another subject, and economics has its own version of the crisis: `ec-955` to `ec-971` card the
credibility revolution, external validity, replication, publication bias, p-hacking and
pre-registration, with **`ec-970` using the minimum wage literature as a worked case study** because it
is the one empirical question a general reader has heard is contested. `ec-986` and `ec-987` card
whether economists missed the financial crisis and what followed from it. **A card on a classic result
states where that result now stands.**

**Sixth: it is not only the mainstream and not only the West.** Deck 8 gives **20 cards to economic
thought before economics**, including Islamic, Chinese and Indian economic thought and the School of
Salamanca, before it reaches Adam Smith. Heterodox schools are carded rather than mentioned —
post-Keynesian, Austrian, institutional, Marxian, feminist, ecological and complexity economics each
have a card — and development economics gets 30, with `ec-717` on colonial legacies. **The test is
whether a school is carded as a position with an argument, or as a curiosity.**

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| What Economics Is | The subject and its questions | 20 | ec-001–020 |
|  | Scarcity, choice and cost | 20 | ec-021–040 |
|  | Models, assumptions and evidence | 25 | ec-041–065 |
|  | What economics can and cannot say | 25 | ec-066–090 |
| Microeconomics | Demand, supply and price | 25 | ec-091–115 |
|  | Choice and the consumer | 25 | ec-116–140 |
|  | Firms, costs and production | 25 | ec-141–165 |
|  | Market structure | 25 | ec-166–190 |
|  | When markets fail | 30 | ec-191–220 |
| Macroeconomics | Measuring an economy | 25 | ec-221–245 |
|  | Output, employment and the short run | 25 | ec-246–270 |
|  | Inflation and prices | 25 | ec-271–295 |
|  | Business cycles and crises | 30 | ec-296–325 |
|  | Macroeconomic policy | 25 | ec-326–350 |
| Money, Banking and Finance | Money and what it does | 25 | ec-351–375 |
|  | Banks and credit | 25 | ec-376–400 |
|  | Central banking | 25 | ec-401–425 |
|  | Financial markets | 20 | ec-426–445 |
|  | Financial crises | 15 | ec-446–460 |
| Government and the Economy | Public goods and public finance | 25 | ec-461–485 |
|  | Taxation | 25 | ec-486–510 |
|  | Regulation and competition policy | 25 | ec-511–535 |
|  | The welfare state | 25 | ec-536–560 |
| Trade and the World Economy | Why countries trade | 25 | ec-561–585 |
|  | Trade policy | 25 | ec-586–610 |
|  | Exchange rates and the balance of payments | 25 | ec-611–635 |
|  | Globalisation and its institutions | 25 | ec-636–660 |
| Growth, Development and Inequality | Economic growth | 30 | ec-661–690 |
|  | Development economics | 30 | ec-691–720 |
|  | Inequality and poverty | 30 | ec-721–750 |
|  | Work, wages and labour markets | 20 | ec-751–770 |
| The History of Economic Thought | Economic thought before economics | 20 | ec-771–790 |
|  | The classical economists | 25 | ec-791–815 |
|  | The marginal revolution | 25 | ec-816–840 |
|  | Keynes and the interwar break | 25 | ec-841–865 |
|  | Economics since 1945 | 25 | ec-866–890 |
| Economics in the World | Behaviour, information and games | 30 | ec-891–920 |
|  | The environment and the long run | 25 | ec-921–945 |
|  | How economists find things out | 30 | ec-946–975 |
|  | The discipline and its critics | 25 | ec-976–1000 |

Deck totals: What Economics Is 90 · Microeconomics 130 · Macroeconomics 130 · Money, Banking and Finance 110 · Government and the Economy 100 · Trade and the World Economy 100 · Growth, Development and Inequality 110 · The History of Economic Thought 120 · Economics in the World 110. **1000.**

## What the weighting is arguing

**Micro and macro take 130 each, which is deliberate parity rather than a dodge.** They are taught as
two halves and they are two halves; giving either more would be taking a position on which is the real
subject, which is itself one of the discipline's arguments and belongs in deck 8 rather than in the
allocation.

**The history of thought takes 120, which is more than any other collection gives its own history.**
Astronomy gives 80 and Dinosaurs 25. The reason is the first scope decision: in astronomy the history
explains how the current picture was arrived at, and in economics **the historical positions are still
held**. A reader who does not know what Keynes, Hayek, Friedman and Marx each claimed cannot follow a
current argument about inflation, debt or industrial policy, because the arguments are conducted in
their terms.

**Money, banking and finance take 110 and finance takes only 35 of it.** The weight is on what money
is, what banks do and what central banks do — the parts a reader meets in the news and has usually
never had explained — rather than on instruments. That split is also what keeps the fourth scope
decision enforceable.

**Growth, development and inequality take 110 together, and inequality takes 30 of it.** These are the
questions a reader most often comes to economics *for*, and they are where the discipline's own
evidence has moved most in twenty years. `ec-735` to `ec-737` card *Capital in the Twenty-First
Century*, its central argument and the criticism of it, in three cards rather than one, because that
is how a contested argument is carded.

**Deck 9 takes 110 and 30 of it is method.** A reader who can tell a difference-in-differences from a
correlation, and who knows what an estimate does not tell them, can read an economic claim in a
newspaper. That is the most transferable thing this collection has to offer and it is weighted to say
so.

**Deck 1 takes 90 and 25 of those are what economics cannot say.** Opening a collection with its own
limits is unusual — Astronomy puts its limits in the method deck and Psychology in its scope section —
and it is done here because the subject is unusually prone to being read as authoritative about
questions it has not addressed.

## Six decisions this plan forced on the tree

**Behavioural economics is one subdeck in deck 9 and not a deck of its own, and it deliberately does
not re-card the psychology.** See "Living beside the other collections": the heuristics themselves are
Psychology's, with twelve cards already planned there. What is here is what behavioural findings do
**to the economic model** — `ec-892` *What behavioural economics challenges*, `ec-893` *The standard
model as a benchmark*, `ec-894` *Departures from expected utility* — plus the economics-native
material: social preferences, the experimental games, behavioural finance and behavioural public
policy.

**Game theory sits with behaviour rather than in microeconomics.** It could have gone in deck 2 beside
oligopoly, and it is carded in deck 9 because its subject is the same one: what the standard model of
choice does when the other party is also choosing. `ec-178` and `ec-179` in the oligopoly subdeck point
forward to it.

**There is no "famous economists" deck.** Smith is in the classical subdeck, Keynes has his own because
the break is a system, Friedman is in *Economics since 1945*. A list of names is what this collection
would become by default.

**Financial crises get their own subdeck rather than sitting inside the business cycle.** Fifteen cards,
because a financial crisis is not just a bad recession — the mechanism is different, the policy response
is different, and the historical episodes are the best-documented natural experiments the subject has.

**Inequality and labour are separate subdecks.** Wages are a market outcome with a literature of its
own; inequality is a distribution with a different literature and different data. Running them together
is how a collection ends up explaining inequality entirely through the labour market, which is one
position among several.

**`ec-999` is "Why economics matters" and `ec-1000` is "What economics still cannot explain".** The
second is earned by the whole plan: a collection that ended on the first would have taught the
confidence its first deck spends 25 cards qualifying.

## Not a textbook, and not a position — the five pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Five things pull an economics card away from the
subject.

**The single framework presented as the subject.** Most introductory material is written from one
school and does not say so. The test is whether a card's claim would be accepted by economists who
disagree about policy; where it would not, the card names the framework. **"Economists agree that…" is
almost always either trivial or false**, and where a genuine professional consensus exists it is
measurable — there are surveys of economists — and should be cited as a survey rather than asserted.

**The political charge.** Minimum wages, immigration, trade, austerity, taxation and inequality are
live political questions on which people have positions before they have evidence, and the accessible
writing on all six is largely advocacy. Give the range of estimates, say who holds which end, and say
what the identification problem is. **Where the evidence genuinely does not settle it, say that.**

**The confident number.** GDP, unemployment, inflation and inequality figures are **constructed**: they
depend on a definition, a survey design and a base year, and they are revised. A card quoting one says
which series, whose, and as of when. **A figure without a vintage is a figure that will be wrong.**

**The just-so story.** Economics rewards a clean mechanism, and a clean mechanism is very easy to write
and very hard to check. Incentives explain everything, institutions explain everything, culture
explains everything. The test is whether the card can name the evidence that would distinguish its
story from the rival one, and `ec-683` to `ec-686` exist precisely so that the competing explanations
of growth are carded as competing.

**The textbook that has not been updated.** This is the subject's version of the Dinosaurs plan's stale
popular science. The Phillips curve, the money multiplier, the Kuznets curve, crowding out and the
efficient market hypothesis are all still taught in the form the evidence has moved past, and the
cards for each (`ec-279`, `ec-381`, `ec-730`, `ec-332`, `ec-439`) are written to say what changed.

## This collection follows the no-researchers rule

**It is NOT excluded from it**, unlike Psychology and Philosophy — and the line is worth stating because
the temptation is the same. In economics a question can nearly always be clued from the **mechanism**:
`ec-192` asks what an externality is, not what Pigou proposed. Deck 8 is the history of thought and is
exempt by the rule's own terms, as `dino-history` is, because there the answer term IS a person or
their work — Smith, Ricardo, Marx, Marshall, Keynes, Hayek, Friedman, Nash.

**The exemption also covers the eponyms that are terms of art**, which economics has more of than most
subjects: `ec-198` the Coase theorem, `ec-076` Arrow's impossibility theorem, `ec-264` Okun's law,
`ec-278` the Phillips curve, `ec-503` the Laffer curve, `ec-566` Heckscher–Ohlin, `ec-671` the Solow
model, `ec-723` the Gini coefficient, `ec-729` the Kuznets curve, `ec-741` the Great Gatsby curve,
`ec-878` the Lucas critique, `ec-912` Nash equilibrium. **In economics an eponym is usually a term
rather than an attribution**, and the test is whether a reader would meet the word again.

**The historiography cap binds everywhere except deck 8**: at most three of ten sentences on who
established a thing. It will bite in deck 3 and deck 9, where the argument about the evidence is
genuinely part of the subject and is therefore carded explicitly (`ec-302`, `ec-955`, `ec-988`,
`ec-989`) so the other cards need not carry it.

## Names, dates and figures

**Most cards in decks 1 to 7 will have NO date line at all, and that is correct.** A concept has no
date. `test-date-line.js` is explicit that a card with nothing datable takes an **empty** line rather
than a filler row, and a non-empty line yielding no sort year is a card that states a date and cannot
be ordered by it. Where a card does take one, it is for an **event** (1929, 1944, 1971, 2008) or a
**work** (1776, 1936, 2013), with `Published`, `Founded`, `Signed`, `Began` and `Ended` as the labels.

**A CURRENCY FIGURE IS NOT CONVERTED AND MUST CARRY A YEAR.** The house units rule converts metric to
imperial; it knows nothing about money, and it should not — an exchange rate is not a unit conversion
and a 1930 dollar is not a 2020 dollar. So a money figure is given **in its own currency with the year
it is measured in** — "about $1.2 trillion in 2015 dollars", "£2 a week in 1900" — and where a card
compares across time it says whether the figure is nominal or real. **A bare currency figure with no
year is the commonest way a card in this collection will be quietly wrong.**

**A statistic is a fact about a definition, a source and a vintage.** Unemployment measured by a labour
force survey is not unemployment measured by benefit claims; GDP is revised for years after the first
estimate; the poverty line moves. Name the series and the date it was read, exactly as the geography
plans cite a database with the date it was consulted.

**Percentages and percentage points are different and the difference is a card** (`ec-974` touches it).
A rise from 4% to 6% is two percentage points and a fifty per cent increase, and economic writing
conflates them constantly.

**Numbers follow the house rules**: non-round numbers above 20 as numerals, a compound in front of
*thousand* written whole, centuries numbered. The metric-first rule rarely arises here, and where it
does — a barrel of oil, an acre of land — the imperial conversion in brackets does not count against
the word limits.

## Sourcing

**Very well served, and the hazard is unusually specific to this subject.**

**The open routes that work.** **NBER working papers**, **CEPR discussion papers** and **IZA** carry a
large share of the research literature in preprint. **RePEc / EconPapers** is the field's index and
resolves almost any citation. The **Journal of Economic Perspectives** is open access, written for
non-specialists by the people who did the work, and is the single best starting point for a card on a
large topic. **VoxEU** carries short authored summaries with links to the papers. **FRED** (the St
Louis Fed) is the standard open series database, and the **World Bank**, **IMF**, **OECD** and
**Our World in Data** publish citable series — **a series is cited with its name and the date it was
read**, as a database always is.

**Five hazards, and the second is the one this subject has worse than any other on the shelf.**

**A working paper is not a published paper.** Most NBER and CEPR papers are unrefereed at the point of
circulation, many change substantially, and some are never published. Cite the journal version where
one exists, and where a card rests on a working paper alone, say so.

**MOST ACCESSIBLE ECONOMIC WRITING COMES FROM ORGANISATIONS WITH POSITIONS.** Think tanks, trade
associations, banks' research arms, advocacy groups and party-aligned institutes all publish work that
looks exactly like research, is often written by economists, and is produced to support a conclusion.
**This is not a reason never to cite them**: a body's own argument is a source for that argument. It is
a reason to **name what the body is** in the citation's vicinity and never to use one as the
independent evidence for a contested empirical claim. **Where a card touches a politically live
question, prefer a refereed paper, a meta-analysis or a survey of economists.**

**An official institution is both a data publisher and an actor.** The IMF, the World Bank, the OECD,
central banks and finance ministries publish the best data in the field *and* publish advocacy for
their own policies. Their statistics are citable as statistics; their assessments of their own
programmes are citable as their own account. `ec-647` IMF conditionality and `ec-649` structural
adjustment are where this bites hardest.

**Textbooks lag, sometimes by decades.** See the fifth pull above. Check the edition and check whether
the result is still held.

**Wikipedia is unusually uneven here** — excellent on the formal theory, weak and sometimes partisan on
the policy questions. Follow it to what it cites, and be more sceptical than usual on anything with a
political charge.

## Living beside the other collections

**THE OVERLAPS WERE MEASURED RATHER THAN ASSUMED, and three collections touch this one. The first is
the sharpest overlap in any plan on the shelf.**

**PSYCHOLOGY HOLDS BEHAVIOURAL ECONOMICS' MECHANISMS — ABOUT TWELVE CARDS — AND THIS COLLECTION MUST
NOT RE-CARD THEM.** `ps-106` is *Behavioural economics* itself; `ps-541` the availability heuristic,
`ps-542` representativeness, `ps-545` anchoring and adjustment, `ps-546` framing effects, `ps-547`
prospect theory, `ps-548` loss aversion, `ps-550` confirmation bias, `ps-553` bounded rationality,
`ps-554` fast and frugal heuristics, `ps-555` nudges and choice architecture, `ps-531` algorithms and
heuristics. **This is a genuine two-discipline subject and the division of labour has to be exact:
Psychology cards these as findings about how minds decide; Economics cards what they do to the model of
choice.** So `ec-891`–`ec-898` are about reference dependence, mental accounting and present bias **as
departures from expected utility**, naming what each breaks in the theory, and **the individual
heuristics are not re-carded at all.** `ec-905` *The evidence on nudges* and `ec-906` *The limits of
nudging* are this collection's own, because the replication and effect-size argument about nudging is
now a policy argument rather than a psychological one. **Read the Psychology card before writing the
economics one.**

**PHILOSOPHY HOLDS THE MORAL ARGUMENTS — about twenty cards.** `ph-519` Adam Smith's moral philosophy,
`ph-576` Karl Marx, `ph-582` Marx's critique of political economy, `ph-499` Locke on property, `ph-893`
Utilitarianism, `ph-896` John Stuart Mill, `ph-962` John Rawls, `ph-963` *A Theory of Justice*, `ph-976`
Distributive justice, `ph-970` Socialism and Marxist political theory. **The rule: `phil` cards the
argument, `econ` cards the economics.** `ec-792`–`ec-797` are Smith on the division of labour, the
invisible hand and what he actually argued; the *Theory of Moral Sentiments* is Philosophy's.
`ec-810`–`ec-813` are Marx on surplus value, crisis and the transformation problem — the economic
model — where the critique of alienation and freedom is `ph-585`'s. **`ec-070`, `ec-081` and `ec-971`
are the deliberate seams**, and each should name the philosophical question rather than answer it.

**WORLD HISTORY HOLDS THE ECONOMIC HISTORY — about twenty-four cards**, from `wh-168` prehistoric trade
and `wh-298` coinage through `wh-684` mercantilism, `wh-726` the Atlantic slave trade, `wh-776` the
Industrial Revolution, `wh-908` the Great Depression and `wh-990` Chinese economic reform. **The
division is that World History cards the EPISODE and this collection cards the ECONOMICS**: `wh-908` is
what the Great Depression was, and `ec-312`–`ec-314` are what caused it, why the explanations differ
and how the recovery came — three cards of argument where World History has one of narrative. Likewise
`wh-684` mercantilism as a period doctrine against `ec-780` mercantilism as a doctrine in the history of
thought. **Check World History's running order before writing any card whose subject is an historical
episode**, and where it is there, write the mechanism rather than the story.

**GLOSSARY: this collection's vocabulary is almost entirely unwritten, and the trap is the opposite of
Korea's.** The terms are not proper nouns but **ordinary English words used as technical terms** —
*demand*, *supply*, *capital*, *rent*, *interest*, *money*, *market*, *firm*, *growth*, *equity*,
*efficiency*, *elasticity*, *utility*, *value*. **Almost none of them may claim its bare surface**, on
`Life_(biology)`'s rule: the corpus is full of ordinary uses of all of them, and an auto-link on
"demand" or "capital" would fire on hundreds of history cards in the wrong sense. **Key them with a
parenthetical** — `Demand_(economics)`, `Capital_(economics)`, `Rent_(economics)` — which claims no
bare name (`bareTaken` in `buildGlossIndex`), and reach them by a narrower alias and a hand-written
`data-k`. **Ask what a one-word answer term is in ordinary English before keying it**, every time; this
collection will ask that question more often than any other.

**Two terms need checking rather than assuming.** `Inflation` and `Externality` are probably safe — the
first has no common non-economic use in this corpus and the second has none at all — but **measure
before claiming**, as the Biology plan did for `cell`, rather than reasoning about it.

# The list

## What Economics Is

### The subject and its questions — `ec-subject`

    ec-001  Economics
    ec-002  What economists study
    ec-003  Microeconomics and macroeconomics
    ec-004  The economic problem
    ec-005  Economics as a social science
    ec-006  Positive and normative economics
    ec-007  The is–ought problem in economics
    ec-008  Economic agents
    ec-009  Households, firms and government
    ec-010  The circular flow of income
    ec-011  Markets
    ec-012  What a market is not
    ec-013  The economy as a system
    ec-014  The questions every society answers
    ec-015  Command, market and mixed economies
    ec-016  Economic systems in practice
    ec-017  Why economists disagree
    ec-018  Schools of economic thought
    ec-019  Economics and the other social sciences
    ec-020  What a first course leaves out

### Scarcity, choice and cost — `ec-scarcity`

    ec-021  Scarcity
    ec-022  Choice under scarcity
    ec-023  Opportunity cost
    ec-024  The production possibility frontier
    ec-025  Trade-offs
    ec-026  Marginal thinking
    ec-027  Marginal cost and marginal benefit
    ec-028  Sunk costs
    ec-029  The sunk cost fallacy
    ec-030  Incentives
    ec-031  Unintended consequences of incentives
    ec-032  Specialisation
    ec-033  The division of labour
    ec-034  Gains from exchange
    ec-035  Comparative advantage as an idea
    ec-036  Absolute advantage
    ec-037  Efficiency
    ec-038  Allocative and productive efficiency
    ec-039  Equity and efficiency
    ec-040  Why efficiency is not the same as good

### Models, assumptions and evidence — `ec-models`

    ec-041  Economic models
    ec-042  What a model is for
    ec-043  Assumptions in economics
    ec-044  Ceteris paribus
    ec-045  Simplification and realism
    ec-046  Homo economicus
    ec-047  Rationality in economics
    ec-048  What rationality means to an economist
    ec-049  Equilibrium
    ec-050  Partial and general equilibrium
    ec-051  Comparative statics
    ec-052  Static and dynamic models
    ec-053  Stocks and flows
    ec-054  Elasticity as a concept
    ec-055  Mathematics in economics
    ec-056  The rise of formal modelling
    ec-057  Economic data
    ec-058  National statistics and where they come from
    ec-059  Correlation and causation in economics
    ec-060  Natural experiments
    ec-061  Econometrics
    ec-062  Forecasting
    ec-063  Why economic forecasts fail
    ec-064  Models and policy advice
    ec-065  Reading an economic claim critically

### What economics can and cannot say — `ec-limits`

    ec-066  The limits of economic method
    ec-067  Uncertainty and risk
    ec-068  Knightian uncertainty
    ec-069  Radical uncertainty
    ec-070  Value judgements in economics
    ec-071  Welfare economics
    ec-072  Pareto efficiency
    ec-073  What Pareto efficiency ignores
    ec-074  The compensation principle
    ec-075  Social welfare functions
    ec-076  Arrow's impossibility theorem
    ec-077  Interpersonal comparisons of utility
    ec-078  Cost–benefit analysis
    ec-079  Putting a price on a life
    ec-080  Discounting the future
    ec-081  Economics and ethics
    ec-082  Economics and power
    ec-083  What economics assumes about people
    ec-084  The performativity of economics
    ec-085  Economics and the natural world
    ec-086  The measurement problem
    ec-087  What gets counted and what does not
    ec-088  Unpaid work and the economy
    ec-089  Economics and its blind spots
    ec-090  Being honest about what is known

## Microeconomics

### Demand, supply and price — `ec-demand`

    ec-091  Demand
    ec-092  The demand curve
    ec-093  The law of demand
    ec-094  Shifts in demand
    ec-095  Supply
    ec-096  The supply curve
    ec-097  Shifts in supply
    ec-098  Market equilibrium
    ec-099  How prices clear a market
    ec-100  Shortages and surpluses
    ec-101  Price elasticity of demand
    ec-102  What determines elasticity
    ec-103  Elasticity and revenue
    ec-104  Price elasticity of supply
    ec-105  Income elasticity
    ec-106  Cross-price elasticity
    ec-107  Substitutes and complements
    ec-108  Normal and inferior goods
    ec-109  Consumer surplus
    ec-110  Producer surplus
    ec-111  Total surplus and market efficiency
    ec-112  Price ceilings
    ec-113  Price floors
    ec-114  The effects of rent control
    ec-115  Taxes, subsidies and who bears them

### Choice and the consumer — `ec-consumer`

    ec-116  Consumer choice
    ec-117  Utility
    ec-118  Cardinal and ordinal utility
    ec-119  Diminishing marginal utility
    ec-120  Preferences and their axioms
    ec-121  Indifference curves
    ec-122  The budget constraint
    ec-123  The consumer's optimum
    ec-124  Income and substitution effects
    ec-125  Giffen goods
    ec-126  Revealed preference
    ec-127  Expected utility
    ec-128  Risk aversion
    ec-129  Insurance and the demand for it
    ec-130  Intertemporal choice
    ec-131  Saving and the rate of interest
    ec-132  Time preference
    ec-133  Hyperbolic discounting
    ec-134  Labour supply and the choice to work
    ec-135  Household production
    ec-136  Consumption over a lifetime
    ec-137  The permanent income hypothesis
    ec-138  Consumption and habit
    ec-139  What the standard model of choice assumes
    ec-140  Where the standard model breaks

### Firms, costs and production — `ec-firm`

    ec-141  The firm
    ec-142  Why firms exist
    ec-143  Transaction costs
    ec-144  The boundaries of the firm
    ec-145  Production functions
    ec-146  Factors of production
    ec-147  Diminishing returns
    ec-148  Returns to scale
    ec-149  Fixed and variable costs
    ec-150  Average and marginal cost
    ec-151  The shape of the cost curve
    ec-152  Economies of scale
    ec-153  Diseconomies of scale
    ec-154  Economies of scope
    ec-155  The short run and the long run
    ec-156  Profit maximisation
    ec-157  Accounting profit and economic profit
    ec-158  Normal profit
    ec-159  The shutdown decision
    ec-160  Entry and exit
    ec-161  The principal–agent problem within the firm
    ec-162  Corporate governance
    ec-163  What firms actually maximise
    ec-164  The firm in the real economy
    ec-165  Small firms and the size distribution

### Market structure — `ec-competition`

    ec-166  Market structure
    ec-167  Perfect competition
    ec-168  What perfect competition assumes
    ec-169  Why perfect competition matters as a benchmark
    ec-170  Monopoly
    ec-171  How a monopoly prices
    ec-172  The deadweight loss of monopoly
    ec-173  Natural monopoly
    ec-174  Price discrimination
    ec-175  Monopolistic competition
    ec-176  Product differentiation
    ec-177  Advertising
    ec-178  Oligopoly
    ec-179  Interdependence and strategy
    ec-180  Cartels
    ec-181  Why cartels break down
    ec-182  Collusion, tacit and explicit
    ec-183  Barriers to entry
    ec-184  Contestable markets
    ec-185  Market power and how it is measured
    ec-186  Concentration in modern economies
    ec-187  Platform markets
    ec-188  Network effects
    ec-189  Winner-take-all markets
    ec-190  Competition as a process

### When markets fail — `ec-failure`

    ec-191  Market failure
    ec-192  Externalities
    ec-193  Negative externalities
    ec-194  Positive externalities
    ec-195  The social cost
    ec-196  Pigouvian taxes
    ec-197  Tradable permits
    ec-198  The Coase theorem
    ec-199  What the Coase theorem assumes
    ec-200  Public goods
    ec-201  Non-rivalry and non-excludability
    ec-202  The free-rider problem
    ec-203  Club goods
    ec-204  Common-pool resources
    ec-205  The tragedy of the commons
    ec-206  Governing the commons
    ec-207  Asymmetric information
    ec-208  Adverse selection
    ec-209  The market for lemons
    ec-210  Moral hazard
    ec-211  Signalling
    ec-212  Screening
    ec-213  Principal and agent
    ec-214  Incomplete markets
    ec-215  Missing markets
    ec-216  Merit and demerit goods
    ec-217  Government failure
    ec-218  Regulatory capture
    ec-219  When intervention makes things worse
    ec-220  Choosing between imperfect options

## Macroeconomics

### Measuring an economy — `ec-measure`

    ec-221  Gross domestic product
    ec-222  How GDP is calculated
    ec-223  The three ways of measuring GDP
    ec-224  Nominal and real GDP
    ec-225  GDP per capita
    ec-226  Purchasing power parity
    ec-227  What GDP leaves out
    ec-228  GDP and welfare
    ec-229  Alternatives to GDP
    ec-230  The Human Development Index
    ec-231  Green accounting
    ec-232  National accounts
    ec-233  The informal economy
    ec-234  Measuring the informal economy
    ec-235  Gross national income
    ec-236  Economic statistics and their revision
    ec-237  Index numbers
    ec-238  The consumer price index
    ec-239  Constructing a price index
    ec-240  Substitution bias in price indices
    ec-241  Measuring unemployment
    ec-242  The labour force survey
    ec-243  Measuring wealth
    ec-244  Comparing economies across time
    ec-245  Comparing economies across countries

### Output, employment and the short run — `ec-output`

    ec-246  Aggregate demand
    ec-247  The components of aggregate demand
    ec-248  Aggregate supply
    ec-249  Short-run and long-run aggregate supply
    ec-250  Macroeconomic equilibrium
    ec-251  The multiplier
    ec-252  The accelerator
    ec-253  Consumption and the macroeconomy
    ec-254  Investment and what drives it
    ec-255  Animal spirits
    ec-256  The paradox of thrift
    ec-257  Unemployment
    ec-258  Types of unemployment
    ec-259  Frictional unemployment
    ec-260  Structural unemployment
    ec-261  Cyclical unemployment
    ec-262  The natural rate of unemployment
    ec-263  Hysteresis in unemployment
    ec-264  Okun's law
    ec-265  Full employment
    ec-266  Labour force participation
    ec-267  Underemployment
    ec-268  The costs of unemployment
    ec-269  Who bears unemployment
    ec-270  Employment and output in the short run

### Inflation and prices — `ec-inflation`

    ec-271  Inflation
    ec-272  Measuring inflation
    ec-273  Demand-pull inflation
    ec-274  Cost-push inflation
    ec-275  The quantity theory of money
    ec-276  Money and prices in the long run
    ec-277  Inflation expectations
    ec-278  The Phillips curve
    ec-279  The breakdown of the Phillips curve
    ec-280  The expectations-augmented Phillips curve
    ec-281  Stagflation
    ec-282  The costs of inflation
    ec-283  Shoe-leather and menu costs
    ec-284  Inflation and redistribution
    ec-285  Indexation
    ec-286  Hyperinflation
    ec-287  Historical hyperinflations
    ec-288  Deflation
    ec-289  Why deflation is feared
    ec-290  The deflationary spiral
    ec-291  Disinflation and the sacrifice ratio
    ec-292  Inflation in the 1970s
    ec-293  The Great Moderation
    ec-294  The return of inflation after 2021
    ec-295  Explaining a burst of inflation

### Business cycles and crises — `ec-cycles`

    ec-296  The business cycle
    ec-297  The phases of the cycle
    ec-298  Recession
    ec-299  Defining a recession
    ec-300  Depression
    ec-301  Leading and lagging indicators
    ec-302  What causes business cycles
    ec-303  Real business cycle theory
    ec-304  Keynesian accounts of the cycle
    ec-305  Monetarist accounts of the cycle
    ec-306  Austrian accounts of the cycle
    ec-307  Minsky and financial instability
    ec-308  Shocks
    ec-309  Supply shocks
    ec-310  Demand shocks
    ec-311  The propagation of shocks
    ec-312  The Great Depression
    ec-313  Explaining the Great Depression
    ec-314  The recovery from the Great Depression
    ec-315  The postwar cycles
    ec-316  The oil shocks
    ec-317  The recessions of the early 1980s
    ec-318  The Japanese lost decades
    ec-319  The Asian financial crisis
    ec-320  The dot-com bubble
    ec-321  The global financial crisis
    ec-322  The euro area crisis
    ec-323  The pandemic recession
    ec-324  Recessions and how they end
    ec-325  Why crises keep happening

### Macroeconomic policy — `ec-policy`

    ec-326  Macroeconomic policy
    ec-327  The goals of macroeconomic policy
    ec-328  Fiscal policy
    ec-329  Automatic stabilisers
    ec-330  Discretionary fiscal policy
    ec-331  Fiscal multipliers
    ec-332  Crowding out
    ec-333  The government budget constraint
    ec-334  Government debt
    ec-335  Debt sustainability
    ec-336  Austerity
    ec-337  The austerity debate
    ec-338  Monetary policy as a tool
    ec-339  The policy interest rate
    ec-340  The transmission of monetary policy
    ec-341  Rules versus discretion
    ec-342  Time inconsistency
    ec-343  Central bank independence
    ec-344  The zero lower bound
    ec-345  Unconventional monetary policy
    ec-346  Quantitative easing
    ec-347  Did quantitative easing work
    ec-348  Coordinating fiscal and monetary policy
    ec-349  Policy lags
    ec-350  The limits of stabilisation policy

## Money, Banking and Finance

### Money and what it does — `ec-monetary`

    ec-351  Money
    ec-352  The functions of money
    ec-353  What makes something money
    ec-354  Commodity money
    ec-355  Fiat money
    ec-356  The origins of money
    ec-357  The barter myth
    ec-358  Credit and debt as money
    ec-359  Coinage and the state
    ec-360  Paper money
    ec-361  The gold standard
    ec-362  The end of the gold standard
    ec-363  Bretton Woods
    ec-364  The collapse of Bretton Woods
    ec-365  Measuring the money supply
    ec-366  Narrow and broad money
    ec-367  The velocity of money
    ec-368  Seigniorage
    ec-369  Legal tender
    ec-370  Currency and the state
    ec-371  Currency unions
    ec-372  Dollarisation
    ec-373  Digital money
    ec-374  Cryptocurrencies
    ec-375  Central bank digital currencies

### Banks and credit — `ec-banks`

    ec-376  Banks
    ec-377  What a bank does
    ec-378  Maturity transformation
    ec-379  Fractional reserve banking
    ec-380  How banks create money
    ec-381  The money multiplier and its limits
    ec-382  Bank balance sheets
    ec-383  Bank capital
    ec-384  Leverage
    ec-385  Liquidity
    ec-386  The interbank market
    ec-387  Credit
    ec-388  Credit rationing
    ec-389  Collateral
    ec-390  Credit scoring
    ec-391  Shadow banking
    ec-392  Securitisation
    ec-393  Bank runs
    ec-394  Deposit insurance
    ec-395  The lender of last resort
    ec-396  Too big to fail
    ec-397  Bank regulation
    ec-398  Basel and capital rules
    ec-399  Stress testing
    ec-400  Banking without banks

### Central banking — `ec-central`

    ec-401  The central bank
    ec-402  The origins of central banking
    ec-403  What central banks do
    ec-404  Monetary policy operations
    ec-405  Open market operations
    ec-406  Reserve requirements
    ec-407  Corridor and floor systems
    ec-408  Inflation targeting
    ec-409  Choosing an inflation target
    ec-410  Dual mandates
    ec-411  Forward guidance
    ec-412  The central bank balance sheet
    ec-413  Central banks and financial stability
    ec-414  Macroprudential policy
    ec-415  The Federal Reserve
    ec-416  The European Central Bank
    ec-417  The Bank of England
    ec-418  The Bank of Japan
    ec-419  Central banks in emerging economies
    ec-420  Central bank independence in practice
    ec-421  Who central banks answer to
    ec-422  Central banks and inequality
    ec-423  Central banks and climate
    ec-424  The limits of central bank power
    ec-425  Criticism of central banking

### Financial markets — `ec-markets`

    ec-426  Financial markets
    ec-427  What financial markets are for
    ec-428  Bonds
    ec-429  Bond prices and yields
    ec-430  The yield curve
    ec-431  Equities
    ec-432  What a share is
    ec-433  Stock markets
    ec-434  Valuing an asset
    ec-435  Present value
    ec-436  Risk and return
    ec-437  Diversification
    ec-438  The efficient market hypothesis
    ec-439  Evidence on market efficiency
    ec-440  Derivatives
    ec-441  Futures and options
    ec-442  Hedging and speculation
    ec-443  Market liquidity
    ec-444  Asset price bubbles
    ec-445  Why bubbles are hard to identify

### Financial crises — `ec-crises`

    ec-446  Financial crisis
    ec-447  The anatomy of a crisis
    ec-448  Historical financial crises
    ec-449  The tulip mania and what it was
    ec-450  The South Sea Bubble
    ec-451  The panic of 1907
    ec-452  The crash of 1929
    ec-453  Contagion
    ec-454  Sudden stops and capital flight
    ec-455  Sovereign debt crises
    ec-456  Debt restructuring
    ec-457  Crisis management
    ec-458  Bailouts
    ec-459  The politics of bailouts
    ec-460  What is learned after a crisis

## Government and the Economy

### Public goods and public finance — `ec-public`

    ec-461  The role of government in the economy
    ec-462  The size of the state
    ec-463  Public expenditure
    ec-464  What governments spend on
    ec-465  Public goods provision
    ec-466  Infrastructure
    ec-467  Public investment
    ec-468  State-owned enterprises
    ec-469  Privatisation
    ec-470  The record of privatisation
    ec-471  Public–private partnerships
    ec-472  Procurement
    ec-473  Government budgeting
    ec-474  Deficits and surpluses
    ec-475  Fiscal rules
    ec-476  Sovereign borrowing
    ec-477  Who holds government debt
    ec-478  Intergenerational accounting
    ec-479  Fiscal federalism
    ec-480  Local government finance
    ec-481  Public choice theory
    ec-482  Rent-seeking
    ec-483  Bureaucracy and incentives
    ec-484  Corruption and the economy
    ec-485  Measuring state capacity

### Taxation — `ec-tax`

    ec-486  Taxation
    ec-487  Why states tax
    ec-488  Direct and indirect taxes
    ec-489  Income tax
    ec-490  Progressive, proportional and regressive taxes
    ec-491  Marginal and average tax rates
    ec-492  Value added tax
    ec-493  Corporation tax
    ec-494  Capital gains tax
    ec-495  Wealth taxes
    ec-496  Inheritance tax
    ec-497  Property taxes
    ec-498  Payroll taxes and social contributions
    ec-499  Tax incidence
    ec-500  Who really pays a tax
    ec-501  The excess burden of taxation
    ec-502  Optimal taxation
    ec-503  The Laffer curve
    ec-504  What the Laffer curve does not show
    ec-505  Tax avoidance and evasion
    ec-506  Tax havens
    ec-507  International tax competition
    ec-508  Taxing multinationals
    ec-509  Tax and behaviour
    ec-510  Designing a tax system

### Regulation and competition policy — `ec-regulation`

    ec-511  Regulation
    ec-512  Why governments regulate
    ec-513  The costs of regulation
    ec-514  Regulating a natural monopoly
    ec-515  Price-cap regulation
    ec-516  Rate-of-return regulation
    ec-517  Deregulation
    ec-518  The record of deregulation
    ec-519  Competition policy
    ec-520  Antitrust
    ec-521  Merger control
    ec-522  Abuse of dominance
    ec-523  Cartel enforcement
    ec-524  Competition policy and big technology
    ec-525  Consumer protection
    ec-526  Product safety and standards
    ec-527  Occupational licensing
    ec-528  Labour market regulation
    ec-529  Environmental regulation as economics
    ec-530  Financial regulation
    ec-531  Regulatory arbitrage
    ec-532  Independent regulators
    ec-533  Cost–benefit analysis in regulation
    ec-534  Nudge and regulation
    ec-535  When to regulate and when not to

### The welfare state — `ec-welfare`

    ec-536  The welfare state
    ec-537  The origins of social insurance
    ec-538  Social insurance and social assistance
    ec-539  Pensions
    ec-540  Pay-as-you-go and funded pensions
    ec-541  The pensions problem
    ec-542  Unemployment insurance
    ec-543  Health care financing
    ec-544  Health insurance and its problems
    ec-545  Education as public spending
    ec-546  Housing policy
    ec-547  Family policy
    ec-548  Means testing
    ec-549  Universal benefits
    ec-550  Conditionality
    ec-551  The poverty trap
    ec-552  Negative income tax
    ec-553  Universal basic income
    ec-554  Evidence on basic income
    ec-555  In-work benefits
    ec-556  Welfare and work incentives
    ec-557  Welfare state models
    ec-558  The politics of redistribution
    ec-559  Does the welfare state cost growth
    ec-560  The welfare state under pressure

## Trade and the World Economy

### Why countries trade — `ec-trade`

    ec-561  International trade
    ec-562  The gains from trade
    ec-563  Comparative advantage
    ec-564  The Ricardian model
    ec-565  Where comparative advantage comes from
    ec-566  The Heckscher–Ohlin model
    ec-567  The Leontief paradox
    ec-568  Intra-industry trade
    ec-569  The new trade theory
    ec-570  Economies of scale and trade
    ec-571  Gravity in trade
    ec-572  Trade costs
    ec-573  Global value chains
    ec-574  Offshoring
    ec-575  Trade and wages
    ec-576  The losers from trade
    ec-577  The China shock
    ec-578  Trade and inequality within countries
    ec-579  Terms of trade
    ec-580  Trade and growth
    ec-581  Services trade
    ec-582  Digital trade
    ec-583  Trade in commodities
    ec-584  Trade and the environment
    ec-585  What trade theory does not predict

### Trade policy — `ec-tradepolicy`

    ec-586  Trade policy
    ec-587  Tariffs
    ec-588  The effects of a tariff
    ec-589  Quotas
    ec-590  Non-tariff barriers
    ec-591  Subsidies and countervailing duties
    ec-592  Dumping and anti-dumping
    ec-593  Protectionism
    ec-594  Arguments for protection
    ec-595  The infant industry argument
    ec-596  Strategic trade policy
    ec-597  Free trade agreements
    ec-598  Customs unions
    ec-599  Trade diversion and trade creation
    ec-600  The most favoured nation principle
    ec-601  The General Agreement on Tariffs and Trade
    ec-602  The World Trade Organization
    ec-603  Trade disputes
    ec-604  The Doha round and its failure
    ec-605  Regional trade blocs
    ec-606  The single market
    ec-607  Sanctions as economic policy
    ec-608  Export controls
    ec-609  The return of industrial policy
    ec-610  The politics of trade policy

### Exchange rates and the balance of payments — `ec-exchange`

    ec-611  The exchange rate
    ec-612  Nominal and real exchange rates
    ec-613  The foreign exchange market
    ec-614  Determining an exchange rate
    ec-615  Purchasing power parity as a theory
    ec-616  Interest parity
    ec-617  Fixed exchange rates
    ec-618  Floating exchange rates
    ec-619  Managed floats
    ec-620  Devaluation and depreciation
    ec-621  Currency pegs and their collapse
    ec-622  Currency crises
    ec-623  The impossible trinity
    ec-624  Capital controls
    ec-625  The balance of payments
    ec-626  The current account
    ec-627  The capital and financial accounts
    ec-628  Current account deficits
    ec-629  Do deficits matter
    ec-630  Global imbalances
    ec-631  Reserve currencies
    ec-632  The dollar's role
    ec-633  Foreign exchange reserves
    ec-634  Sovereign wealth funds
    ec-635  The international monetary system

### Globalisation and its institutions — `ec-global`

    ec-636  Globalisation
    ec-637  Measuring globalisation
    ec-638  Waves of globalisation
    ec-639  The first globalisation and its end
    ec-640  Postwar liberalisation
    ec-641  Multinational firms
    ec-642  Foreign direct investment
    ec-643  Migration and the economy
    ec-644  The economics of immigration
    ec-645  Remittances
    ec-646  The International Monetary Fund
    ec-647  IMF conditionality
    ec-648  The World Bank
    ec-649  Structural adjustment
    ec-650  The Washington Consensus
    ec-651  Criticism of the Washington Consensus
    ec-652  Capital account liberalisation
    ec-653  International financial architecture
    ec-654  Global economic governance
    ec-655  The G7 and the G20
    ec-656  Regional development banks
    ec-657  Deglobalisation
    ec-658  Supply chain resilience
    ec-659  Economic statecraft
    ec-660  The world economy after 2020

## Growth, Development and Inequality

### Economic growth — `ec-growth-theory`

    ec-661  Economic growth
    ec-662  Why growth matters
    ec-663  The power of compounding
    ec-664  Growth before 1800
    ec-665  The great enrichment
    ec-666  Sources of growth
    ec-667  Capital accumulation
    ec-668  Labour and human capital
    ec-669  Total factor productivity
    ec-670  Growth accounting
    ec-671  The Solow model
    ec-672  Convergence
    ec-673  Conditional convergence
    ec-674  Why convergence often fails
    ec-675  Endogenous growth theory
    ec-676  Ideas and increasing returns
    ec-677  Technology and growth
    ec-678  General purpose technologies
    ec-679  Innovation and its incentives
    ec-680  Patents and intellectual property
    ec-681  Research and development
    ec-682  Diffusion of technology
    ec-683  Institutions and growth
    ec-684  Property rights and growth
    ec-685  Geography and growth
    ec-686  Culture and growth
    ec-687  The productivity slowdown
    ec-688  Explaining the productivity slowdown
    ec-689  Is growth over
    ec-690  Limits to growth

### Development economics — `ec-development`

    ec-691  Development economics
    ec-692  What development means
    ec-693  Measuring development
    ec-694  The persistence of poverty
    ec-695  The poverty trap idea
    ec-696  Big push theories
    ec-697  Dual economy models
    ec-698  Structural transformation
    ec-699  Industrialisation and development
    ec-700  Import substitution
    ec-701  Export-led growth
    ec-702  The East Asian miracle
    ec-703  Explaining the East Asian miracle
    ec-704  The resource curse
    ec-705  Dutch disease
    ec-706  Agriculture and development
    ec-707  The green revolution
    ec-708  Land reform
    ec-709  Microfinance
    ec-710  Evidence on microfinance
    ec-711  Aid
    ec-712  Does aid work
    ec-713  Cash transfers
    ec-714  Conditional cash transfers
    ec-715  Health and development
    ec-716  Education and development
    ec-717  Colonial legacies and development
    ec-718  Institutions and development
    ec-719  The randomista turn
    ec-720  What development economics has learned

### Inequality and poverty — `ec-inequality`

    ec-721  Economic inequality
    ec-722  Measuring inequality
    ec-723  The Gini coefficient
    ec-724  Income shares and the top one per cent
    ec-725  Wealth inequality
    ec-726  Why wealth is more unequal than income
    ec-727  Inequality between countries
    ec-728  Global inequality
    ec-729  The Kuznets curve
    ec-730  Evidence against the Kuznets curve
    ec-731  The rise in inequality since 1980
    ec-732  Explaining rising inequality
    ec-733  Skill-biased technological change
    ec-734  Institutions and inequality
    ec-735  Capital in the twenty-first century
    ec-736  The argument that returns outpace growth
    ec-737  Criticism of that argument
    ec-738  Inheritance and the transmission of advantage
    ec-739  Social mobility
    ec-740  Measuring social mobility
    ec-741  The Great Gatsby curve
    ec-742  Poverty
    ec-743  Absolute and relative poverty
    ec-744  The poverty line
    ec-745  Measuring global poverty
    ec-746  The fall in extreme poverty
    ec-747  Deprivation beyond income
    ec-748  Inequality of opportunity
    ec-749  Does inequality matter for growth
    ec-750  Policies that reduce inequality

### Work, wages and labour markets — `ec-labour`

    ec-751  The labour market
    ec-752  Labour demand
    ec-753  Labour supply
    ec-754  Wage determination
    ec-755  Human capital
    ec-756  The returns to education
    ec-757  Signalling and education
    ec-758  The wage premium
    ec-759  Compensating differentials
    ec-760  Discrimination in the labour market
    ec-761  Measuring discrimination
    ec-762  The gender pay gap
    ec-763  Explaining the gender pay gap
    ec-764  Monopsony in the labour market
    ec-765  The minimum wage
    ec-766  The minimum wage debate
    ec-767  Trade unions and wages
    ec-768  The decline of union membership
    ec-769  The gig economy
    ec-770  Automation and jobs

## The History of Economic Thought

### Economic thought before economics — `ec-before`

    ec-771  Economic thought before economics
    ec-772  Aristotle on exchange
    ec-773  The just price
    ec-774  Usury and its prohibition
    ec-775  Islamic economic thought
    ec-776  Chinese economic thought
    ec-777  Indian economic thought
    ec-778  Scholastic economics
    ec-779  The School of Salamanca
    ec-780  Mercantilism as a doctrine
    ec-781  Bullionism
    ec-782  Cameralism
    ec-783  The Physiocrats
    ec-784  The Tableau économique
    ec-785  Petty and political arithmetic
    ec-786  Cantillon
    ec-787  Hume on money and trade
    ec-788  Mandeville and private vices
    ec-789  Before the word economics
    ec-790  What the classical economists inherited

### The classical economists — `ec-classical`

    ec-791  Classical economics
    ec-792  Adam Smith
    ec-793  The Wealth of Nations
    ec-794  Smith on the division of labour
    ec-795  The invisible hand
    ec-796  What Smith actually argued
    ec-797  Smith and self-interest
    ec-798  Thomas Malthus
    ec-799  The Malthusian trap
    ec-800  Why Malthus was wrong about the nineteenth century
    ec-801  David Ricardo
    ec-802  Ricardo on rent
    ec-803  Ricardo on comparative advantage
    ec-804  The labour theory of value
    ec-805  Say's law
    ec-806  Jean-Baptiste Say
    ec-807  John Stuart Mill as an economist
    ec-808  The stationary state
    ec-809  The wages fund doctrine
    ec-810  Karl Marx as an economist
    ec-811  Marx on surplus value
    ec-812  Marx on crisis
    ec-813  The transformation problem
    ec-814  The classical school and its collapse
    ec-815  What survives of classical economics

### The marginal revolution — `ec-marginal`

    ec-816  The marginal revolution
    ec-817  Jevons, Menger and Walras
    ec-818  Marginal utility
    ec-819  The diamond–water paradox
    ec-820  Alfred Marshall
    ec-821  The Marshallian cross
    ec-822  Partial equilibrium analysis
    ec-823  Walras and general equilibrium
    ec-824  The Austrian school
    ec-825  Menger and subjective value
    ec-826  The socialist calculation debate
    ec-827  Hayek on knowledge
    ec-828  Mises and economic calculation
    ec-829  The Lausanne school
    ec-830  Vilfredo Pareto
    ec-831  Arthur Pigou
    ec-832  Welfare economics before Keynes
    ec-833  Imperfect competition theory
    ec-834  Joan Robinson
    ec-835  Chamberlin and monopolistic competition
    ec-836  Frank Knight
    ec-837  The Chicago school's beginnings
    ec-838  Institutional economics
    ec-839  Thorstein Veblen
    ec-840  Economics becomes a profession

### Keynes and the interwar break — `ec-keynes`

    ec-841  John Maynard Keynes
    ec-842  Keynes before the General Theory
    ec-843  The Economic Consequences of the Peace
    ec-844  The General Theory
    ec-845  Effective demand
    ec-846  Keynes against Say's law
    ec-847  The consumption function
    ec-848  Liquidity preference
    ec-849  Keynes on expectations
    ec-850  Keynes on uncertainty
    ec-851  The Keynesian revolution
    ec-852  The IS–LM model
    ec-853  Hicks and the neoclassical synthesis
    ec-854  The Keynesian consensus
    ec-855  Keynesian policy in practice
    ec-856  The Cambridge school
    ec-857  Michal Kalecki
    ec-858  Post-Keynesian economics
    ec-859  The capital controversies
    ec-860  Critics of Keynes
    ec-861  Hayek against Keynes
    ec-862  The Austrian business cycle account
    ec-863  Keynes and Bretton Woods
    ec-864  What Keynes got wrong
    ec-865  Why Keynes keeps returning

### Economics since 1945 — `ec-postwar`

    ec-866  Economics after 1945
    ec-867  The mathematisation of economics
    ec-868  Samuelson and modern economics
    ec-869  Arrow and Debreu
    ec-870  General equilibrium proved
    ec-871  Game theory enters economics
    ec-872  Von Neumann and Morgenstern
    ec-873  John Nash
    ec-874  Monetarism
    ec-875  Milton Friedman
    ec-876  The monetarist counter-revolution
    ec-877  Rational expectations
    ec-878  The Lucas critique
    ec-879  New classical economics
    ec-880  Real business cycle theory as a school
    ec-881  New Keynesian economics
    ec-882  The new neoclassical synthesis
    ec-883  Development economics as a field
    ec-884  Public choice as a school
    ec-885  The economics of information
    ec-886  The Nobel prize in economics
    ec-887  What the prize has rewarded
    ec-888  Heterodox economics
    ec-889  Economics after the financial crisis
    ec-890  Where economic theory stands

## Economics in the World

### Behaviour, information and games — `ec-behavioural`

    ec-891  Behavioural economics
    ec-892  What behavioural economics challenges
    ec-893  The standard model as a benchmark
    ec-894  Departures from expected utility
    ec-895  Reference dependence
    ec-896  Mental accounting
    ec-897  Present bias in economics
    ec-898  Self-control and commitment devices
    ec-899  Social preferences
    ec-900  Fairness in economic experiments
    ec-901  The ultimatum game
    ec-902  The dictator game
    ec-903  Trust and reciprocity
    ec-904  Behavioural public policy
    ec-905  The evidence on nudges
    ec-906  The limits of nudging
    ec-907  Behavioural finance
    ec-908  Anomalies in asset prices
    ec-909  Game theory
    ec-910  Strategic interaction
    ec-911  The prisoner's dilemma
    ec-912  Nash equilibrium
    ec-913  Dominant strategies
    ec-914  Repeated games
    ec-915  Credible threats and commitment
    ec-916  Bargaining
    ec-917  Auctions
    ec-918  Auction design
    ec-919  Market design
    ec-920  Matching markets

### The environment and the long run — `ec-environment`

    ec-921  Environmental economics
    ec-922  The environment as an economic problem
    ec-923  Natural capital
    ec-924  Ecosystem services
    ec-925  Valuing the environment
    ec-926  Contingent valuation
    ec-927  Pollution as an externality
    ec-928  Emissions trading
    ec-929  Carbon taxes
    ec-930  Carbon pricing in practice
    ec-931  The economics of climate change
    ec-932  The social cost of carbon
    ec-933  Discounting and climate
    ec-934  The Stern review and its critics
    ec-935  Integrated assessment models
    ec-936  Uncertainty and climate policy
    ec-937  Tipping points and fat tails
    ec-938  Estimating climate damages
    ec-939  Adaptation and mitigation
    ec-940  The energy transition
    ec-941  Green industrial policy
    ec-942  The rebound effect
    ec-943  Degrowth
    ec-944  Ecological economics
    ec-945  Sustainability and what it requires

### How economists find things out — `ec-methods`

    ec-946  Economic method
    ec-947  Theory and evidence in economics
    ec-948  Observational data
    ec-949  Identification
    ec-950  Omitted variable bias
    ec-951  Instrumental variables
    ec-952  Difference in differences
    ec-953  Regression discontinuity
    ec-954  Randomised controlled trials in economics
    ec-955  The credibility revolution
    ec-956  What the credibility revolution changed
    ec-957  External validity
    ec-958  Structural estimation
    ec-959  Calibration and simulation
    ec-960  Laboratory experiments in economics
    ec-961  Field experiments
    ec-962  Administrative data
    ec-963  Big data in economics
    ec-964  Machine learning in economics
    ec-965  Replication in economics
    ec-966  The replication record
    ec-967  Publication bias in economics
    ec-968  P-hacking and specification searching
    ec-969  Pre-registration
    ec-970  The minimum wage literature as a case study
    ec-971  Meta-analysis in economics
    ec-972  Reading an empirical paper
    ec-973  What an estimate does not tell you
    ec-974  Statistical and economic significance
    ec-975  Honesty about uncertainty

### The discipline and its critics — `ec-discipline`

    ec-976  Economics as a profession
    ec-977  Who becomes an economist
    ec-978  Economics teaching
    ec-979  The curriculum debate
    ec-980  Diversity in economics
    ec-981  Economists in government
    ec-982  Economists and the public
    ec-983  The influence of economics on policy
    ec-984  Economics and the media
    ec-985  Conflicts of interest in economics
    ec-986  Did economists miss the financial crisis
    ec-987  The consequences of missing it
    ec-988  Criticism from within economics
    ec-989  Criticism from outside economics
    ec-990  Feminist economics
    ec-991  Marxian economics today
    ec-992  Complexity economics
    ec-993  Economic anthropology and its challenge
    ec-994  Economics and history
    ec-995  Economic history as a discipline
    ec-996  What economics borrowed from other fields
    ec-997  What other fields borrowed from economics
    ec-998  The future of economic theory
    ec-999  Why economics matters
    ec-1000  What economics still cannot explain
