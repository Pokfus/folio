# Psychology — a 1000-card running order

The plan for `psych`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twelfth of these and **the first that is not a history collection**, which is why several of
the house rules below are restated rather than pointed at. Read `docs/greece-card-plan.md` first if
this is the first plan you have met; the mechanics are identical and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `ps-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='ps-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `ps-001` … `ps-999`, then `ps-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`ps-470 Working memory` is already an answer term; `ps-451 What learned helplessness turned out to be`
is an argument to describe, and the card's actual answer — the word that gets blanked — is chosen while
writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** When that happens,
change the line here in the same commit as the card, and say so — this file is only useful while it is
true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file. That is the Egypt, Second World War and Japan
case rather than the Rome, Russia, India and United States one, where the node was already sitting
empty.

**The id is `psych`**, following the readable-id precedent set by `china`, `egypt`, `ww2` and `japan`
rather than taking the next `col-NN`. **The card prefix is `ps-`**, free of every existing prefix
(`wh-`, `gr-`, `rm-`, `us-`, `ru-`, `in-`, `cnh-`, `eg-`, `ww2-`, `jp-`, `geo-`) and no prefix of any
of them.

**The hue is `#82607E`, a muted plum**, and it was measured rather than picked. Swept in CIELAB against
all eighteen hues already on the shelf — eleven collections and seven languages — inside the shelf's own
band (L\* 28–55, chroma 7–62), the freest region of the whole wheel is the mauve/plum quadrant: the peak
candidate sits **30.1** from its nearest neighbour, against a **tightest existing pair of 12.9** (China's
vermilion against Russia's lacquer red). This is one step off that peak. It stands **27.1** from its two
nearest neighbours, the United States' navy and Japan's kuwazome red-purple — still more than double the
tightest pair the shelf already tolerates — at L\* 45 and chroma 22, both mid-band, and it reads 5.4:1
against white, against a shelf that runs 3.7 to 10.4. The peak was given up for the contrast: at 4.7:1
it sat at the bottom of that range.

**Two other free regions were measured and rejected, which is worth recording so nobody re-runs the
sweep.** An olive-brass around hue 100 scores 27.4 and is the second-best number on the wheel, but it
is the fourth thing in the yellow-green-brown quarter after World History's sepia, Geography's olive
and German's brown — a number is not a look, and four neighbours in one quarter read as a family. A hot
magenta scores 28.3 at chroma 62, the very top of the band, and would be the loudest thing on a shelf
whose whole register is muted. The plum is quieter than either and measures better than both.

**It gets a `COLLECTION_ICON` row and a new symbol, `head`** — a head in profile, added to
`ICON_SYMBOLS`. Two candidates were drawn and the reasoning is worth keeping. **The obvious mark is the
Greek letter psi**, which is the discipline's own emblem and would be trivial to draw as bare paths —
but Ancient Greece is on the same shelf, and a Greek letter beside a Doric column says *Greece* to a
reader scanning for a subject rather than reading the label. **The head in profile was checked against
the one mark it could be confused with**, the account tab's front-facing bust: that is a circle over a
shoulder curve, where this is a single outline with a brow, a nose and a chin, and the two do not
resemble each other at the 28px a deck row draws them at.

**It has NO section on the Collections page yet, and that is deliberate — but the table entry ships
anyway.** `COLLECTION_SECTIONS` names History and Geography; `sectionOf` returns History for anything
not in `COLLECTION_SECTION`, so a Psychology collection that ever gained a card would be filed under
History without anything on the page saying so. So a **Science** section is added to the table now, with
`psych` mapped to it. It draws NOTHING while the collection is coming-soon — `PAGES.decks` skips a
section with no available collections, and only History gets an empty slot, for its drop target — so the
change is inert until the first card ships and then correct without anybody remembering this paragraph.
The heading is *Science* rather than *Psychology* on the same reasoning that made *Geography* a heading
rather than a collection: the next science collection should not need a second one.

## What this collection is about, and the five scope decisions

**It is the whole discipline, not the clinic.** What most people mean by "psychology" is therapy and
mental illness, and that is one of nine decks. The other eight are a science: how the nervous system
produces behaviour, how the senses build a world, how people learn and remember and decide, how they
develop, how they differ, and how they behave in the presence of other people. A reader who finishes
this collection should be able to open a psychology textbook at any chapter and recognise what it is
about, and — the harder half — read a newspaper report of a study and know which questions to ask of it.

**First: the replication crisis is carded where it happened, not filed at the end.** Deck 2 has a
subdeck that names it, but the standing rule for the whole collection is that **a card on a classic
finding states that finding's current evidential standing**. Where a famous result has failed to
replicate or been substantially revised there is a deliberate PAIR of cards — the study, and what
happened to it. `ps-450`/`ps-451` on learned helplessness; `ps-207`/`ps-208` on the Stanford prison
experiment; `ps-209`/`ps-210` on Milgram and `ps-830` on what his experiments are now taken to show;
`ps-715` on the marshmallow test; `ps-720` on ego depletion; `ps-807` on social priming; `ps-772` on
stereotype threat; `ps-806` on the Implicit Association Test; `ps-676` on facial feedback; `ps-970` on
the Type A behaviour pattern. **The pair is not padding.** Merging each into one card leaves two bad
options: teach a result the field no longer believes, or withhold the classic every textbook still
names and every reader has already met. The pair teaches both, in the order they happened.

**Second: a card about a disorder describes it and never diagnoses.** No second person, no checklist
that reads as a self-test, no symptom list that invites a reader to score themselves. A disorder card
gives the recognised description, where it sits in **both** classifications, what is known about cause
and course, and how it is treated. Both are named because neither is universal: the ICD is what most of
the world's health systems actually use and the DSM is what most of the research is written in, and a
card that names only one has quietly taken a side in a live professional argument. Prevalence figures
are given as ranges, with whose they are — the house rule from the history plans, and it bites harder
here, since prevalence depends on the definition being counted.

**Third: contested constructs are carded as contested, and the myths are carded as myths.** A reader
arrives holding some of these, so leaving them out leaves the reader holding them. Learning styles
(`ps-779`), the left-brain/right-brain story (`ps-276`), the Myers-Briggs Type Indicator (`ps-735`), the
Barnum effect that keeps personality quizzes in business (`ps-739`), phrenology (`ps-029`) and the
recovered memory controversy (`ps-500`) each get a card that names the claim, says what evidence there
is, and says what is actually known. **The card is not a debunking.** A card that only sneers teaches
nothing; the reader needs to know why the idea was believed, which is usually that it explains something
real badly rather than nothing at all.

**Fourth: a finding is described with the people it was found in.** Most of psychology's evidence comes
from Western, educated, industrialised, rich and democratic samples — undergraduates, largely, in a
handful of countries — and `ps-101` cards that fact directly. The standing rule that follows from it:
where cross-cultural evidence exists, the card gives it; where it does not, the card says the generality
is unknown rather than writing a sentence that implies a fact about human beings. This is the psychology
form of the history plans' rule that no state's account of its own actions is repeated as established
fact, and it is the single easiest rule in this file to break by accident, because the textbook sentence
is almost always the universal one.

**Fifth: psychology's own record on race, sex and eugenics is carded as history.** `ps-042` on eugenics
and the first mental tests, `ps-771` on how group differences in test scores are argued about, `ps-861`
on race and psychological research, `ps-060` on the women shut out of the first generation and `ps-862`
on gender stereotypes. Not as an apology, not as a footnote, and not as a modern verdict on the dead:
what was claimed, by whom, on what evidence, and what the evidence actually supported. Several of the
discipline's founders are in this material, and the cards on them say so.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Foundations and History | What psychology is | 20 | ps-001–020 |
|  | Philosophical and physiological roots | 25 | ps-021–045 |
|  | The founding schools | 35 | ps-046–080 |
|  | The cognitive revolution and modern psychology | 30 | ps-081–110 |
| Research Methods and Statistics | Research designs | 30 | ps-111–140 |
|  | Measurement and psychometrics | 25 | ps-141–165 |
|  | Statistics and inference | 30 | ps-166–195 |
|  | Ethics, integrity and the replication crisis | 25 | ps-196–220 |
| Biological Psychology | Neurons and neurotransmission | 25 | ps-221–245 |
|  | The nervous system and the brain | 35 | ps-246–280 |
|  | Methods in neuroscience | 20 | ps-281–300 |
|  | Genes, evolution and behaviour | 20 | ps-301–320 |
|  | Hormones, drugs and altered states | 15 | ps-321–335 |
| Sensation and Perception | Sensation and psychophysics | 20 | ps-336–355 |
|  | Vision | 35 | ps-356–390 |
|  | Hearing and the other senses | 20 | ps-391–410 |
|  | Perceptual organisation and illusions | 15 | ps-411–425 |
| Learning, Memory and Cognition | Conditioning and learning | 35 | ps-426–460 |
|  | Memory | 40 | ps-461–500 |
|  | Attention and consciousness | 25 | ps-501–525 |
|  | Thinking, reasoning and decision-making | 30 | ps-526–555 |
|  | Language | 15 | ps-556–570 |
| Development across the Lifespan | Infancy and early childhood | 30 | ps-571–600 |
|  | Cognitive development | 25 | ps-601–625 |
|  | Social and moral development | 25 | ps-626–650 |
|  | Adolescence, adulthood and ageing | 20 | ps-651–670 |
| Emotion, Motivation and Individual Differences | Emotion | 30 | ps-671–700 |
|  | Motivation | 20 | ps-701–720 |
|  | Personality | 35 | ps-721–755 |
|  | Intelligence and its testing | 25 | ps-756–780 |
| Social Psychology | The self and social cognition | 30 | ps-781–810 |
|  | Attitudes and social influence | 30 | ps-811–840 |
|  | Groups, prejudice and intergroup relations | 30 | ps-841–870 |
|  | Relationships, helping and aggression | 20 | ps-871–890 |
| Mental Health and Applied Psychology | Psychological disorders | 40 | ps-891–930 |
|  | Assessment and treatment | 30 | ps-931–960 |
|  | Health, stress and wellbeing | 20 | ps-961–980 |
|  | Work, law, education and sport | 20 | ps-981–1000 |

Deck totals: Foundations and History 110 · Research Methods and Statistics 110 · Biological Psychology 115 · Sensation and Perception 90 · Learning, Memory and Cognition 145 · Development across the Lifespan 100 · Emotion, Motivation and Individual Differences 110 · Social Psychology 110 · Mental Health and Applied Psychology 110. **1000.**
## What the weighting is arguing

**Methods and statistics get a whole deck of 110, and it comes second.** No other collection on this
site spends a ninth of itself on how its subject is studied, and no other collection needs to. The
central controversy in psychology over the last fifteen years is about its own methods: findings in
every one of the other eight decks have been withdrawn, halved or overturned on grounds a reader cannot
follow without knowing what a p value is (`ps-179`), what it is not (`ps-180`), what an effect size is
(`ps-183`) and why a meta-analysis is not automatically the answer (`ps-140`). A collection that put
this in an appendix would be teaching a thousand findings and no way to weigh any of them.

**Learning, Memory and Cognition is the largest deck at 145.** It is the core of the discipline as a
science — the part that has produced replicable results for a century, that carries the most vocabulary
a reader will meet again, and that most of the rest of the collection depends on. Memory alone takes 40.

**Biological psychology takes 115, the largest deck after cognition.** Most of the discipline's money
and most of its recent findings are there, and the vocabulary is what a reader needs to read a
newspaper report: the amygdala, dopamine, fMRI, plasticity. The methods subdeck of 20 is where the
scepticism lives (`ps-294` reverse inference, `ps-296` thresholding), because a brain photograph makes
a weak claim look strong and nothing else in the collection has that particular power.

**Clinical psychology takes 70 of the thousand — 40 on disorders and 30 on treatment.** That is far
less than a reader expects and it is the point of the weighting. What most people mean by "psychologist"
is a clinician, and clinical is one branch of a discipline that is mostly not clinical. The 70 are
enough to describe every major diagnostic category, the classifications and their critics, and the
treatments that have evidence behind them.

**Sensation and perception get 90 and vision alone gets 35.** Vision is the sense psychology understands
best, the one where the path from receptor to cortex to percept can actually be traced end to end, and
therefore the one place where a reader can see what a complete psychological explanation looks like.

**Social psychology gets 110 and its results carry the most caveats in the collection.** It is where the
famous experiments are, where the replication crisis hit hardest, and where the WEIRD problem bites
worst. The deck is written to be teachable anyway: the phenomena are real, and the argument is about
their size and their generality rather than their existence.

## Six decisions this plan forced on the tree

**Methods sit second rather than last, and that is the load-bearing one.** Everything after deck 2
depends on it, and a reader who works through in order meets the tools before the findings. It is also
the deck most likely to be skipped if it sat at the end, which is the argument in one line.

**Attention and consciousness sit in Cognition, not in Perception.** Both readings are defensible and
the deciding argument is the subdeck's own back half: sleep, dreaming and hypnosis are *states* rather
than percepts, and the front half — selective attention, the Stroop effect, inattentional blindness — is
continuous with the working memory cards directly above it. Filing the whole subdeck under perception
would have split it.

**Intelligence sits with personality in the Individual Differences deck, not with thinking and
reasoning.** Intelligence testing is the study of how people DIFFER, and it is historically and
methodologically continuous with personality measurement: the same factor analysis, the same
psychometrics, the same century-old argument about what a test score means. Carding it beside reasoning
would have filed it as a cognitive process and lost all of that — and would have separated `ps-762`
(Spearman's g) from `ps-160` and `ps-726`, which are the same machinery applied twice.

**There is no "famous experiments" deck, and it would have been the worst deck on the site.** It is what
a reader thinks psychology is, and collecting Milgram, Zimbardo, Asch, Harlow, Little Albert and the
Robbers Cave into one place makes a true-crime shelf out of a science. Each is carded where its FINDING
belongs — obedience and conformity in social influence (`ps-825`, `ps-829`), attachment in development
(`ps-587`), conditioning in the founding schools (`ps-065`), intergroup conflict in the groups deck
(`ps-857`) — and the ethics of the worst of them are carded in the ethics subdeck (`ps-207`–`ps-210`),
where a reader meets them as the reason the rules changed.

**Freud is carded in the history deck and Piaget in the development deck, and the placement is the
judgement.** Freud gets five cards in deck 1 and is picked up again in personality and in therapy,
because his influence on the twentieth century is the fact about him and his standing as a scientist is
poor. Piaget gets the first eleven cards of `ps-dev-cog`, including `ps-611` on the criticisms, because
his specific claims have been substantially revised and his framework still organises how the subject is
taught. Neither placement is a verdict; both are about what a reader needs the name for.

**Every one of the nine decks except methods is a subject a university teaches as its own module**, and
the deck titles are the module names rather than anything invented here. That is deliberate: a reader
who wants to go further should be able to map this collection onto a syllabus without translation.

## Science, not folklore — and the five pulls

**The rule this section is a local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Five things pull a psychology card away from its
subject, and the first two are the dangerous ones.

**The single striking study.** A result from one experiment on forty undergraduates is not a fact about
human beings, and the striking ones are exactly the ones that reach the textbooks and the newspapers.
The rule: **prefer a meta-analysis, a multi-lab replication or a review**; where a card rests on one
study, the card says so in its own prose, not only in its citations. "In one experiment…" is a different
sentence from "people are…", and the difference is most of what this collection is for.

**Pop psychology.** Vastly more popular material exists about this subject than scholarly material, it
is written to be memorable, and it turns up first in every search. Birth order, the Mozart effect, body
language "tells", the left brain, learning styles, personality types, the 10 per cent of the brain: some
of it is discredited, some was never a claim anybody tested, and all of it is confidently sourced.
Where the collection cards one it cards it as a claim with a history, never as a finding.

**The neuro-veneer.** A brain-imaging photograph beside a weak claim makes it look strong, and this is
measurable rather than a matter of taste. A card whose evidence is a neuroimaging result says what was
measured — a correlation between a task and a blood-oxygen signal — rather than that a region "lights
up" or "is responsible for" something.

**Self-diagnosis.** The disorder cards are read by people wondering about themselves, and a card written
as a symptom list invites a reader to score themselves against it. Scope decision two above is the rule;
this is the reminder that it is the pull, not an abstract principle.

**The essentialist slide.** Sex differences, group differences, personality "types", national character:
the honest sentence states a measured distribution and how far the two distributions overlap, and the
dishonest one names a type. A card that says a group *is* something has adopted the claim; a card that
says a measured mean differed by so much, with this much overlap, in these samples, has described one.
`ps-771` and `ps-774` are where this is hardest, and both are carded as arguments rather than answers.

## THIS COLLECTION IS EXCLUDED FROM THE NO-RESEARCHERS RULE (on request, Aug 2026)

**CLAUDE.md says a question may never name a researcher or scholar, and caps modern scholars at two per
collection. Neither applies here. The site owner excluded this collection from that rule outright**, and
the reason is the one the rule itself implies: it was written for the history collections, where naming
the modern arguer makes the card about the literature instead of about the past. **In psychology the
literature IS the subject matter.** A finding is a study, a theory carries its author's name, and the
discipline is 150 years old, so almost everything in it is modern by the history plans' measure. A
question is free to say *Pavlov*, *Skinner*, *Piaget*, *Kahneman* or *Bandura*, and a card may have any
of them as its answer term. There is no cap, and no exemption has to be argued for.

**What that does not license is a card about the literature instead of about the mind.** The rule is
lifted; the thing it was protecting is worth keeping as craft rather than as law. A question clued from
the FINDING is almost always the better card — *what working memory does* teaches more than *who
proposed it* — so reach for the person when the person is the point, not by default. Two places where
naming is plainly right: a card whose answer IS the person or their named study (`ps-046` Wundt,
`ps-825` the Asch conformity experiments), and a theory or law that carries the name (`ps-438` the
Rescorla–Wagner model, `ps-705` the Yerkes–Dodson law).

**The historiography cap is a separate rule and this plan keeps it, with an exception.** An abstract may
narrate the study that established a finding — that is the finding's evidence, not historiography, and
in this subject the two are the same sentences. What stays capped at three of ten sentences is the
*dispute*: who challenged whom, in which journal, and who replied. The exception is the cards whose
subject IS the dispute — the replication pairs under scope decision one, `ps-211` to `ps-220`, `ps-611`,
`ps-640`, `ps-900`, `ps-951` — where the argument is the answer term.

**`.claude/card-focus.js` will flag this collection heavily and the flags are NOISE here, not findings.**
The script takes names from the author positions of a card's own citations, so a card citing Kahneman and
Tversky and naming either in its question trips it — correctly, by a rule that no longer binds. Do not
clear the flags card by card through `EXEMPT`, which would be forty entries each justified by the same
sentence; **the exclusion is collection-wide and is recorded here and in CLAUDE.md**. Running the measure
with `--prefix=ps-` is still worth doing for its OTHER half, the majority-historiography count, which
does still bind.

**And rule 2 bites in `ps-roots` for a reason worth knowing before writing there, found on `ps-024`.**
The measure counts a sentence as historiography when it names one of the card's OWN citation authors, and
the roots deck cites its subjects directly — Locke, Hume, Leibniz, Descartes, James — so a card about
Locke's argument, cited to Locke, reads to the script as a card about a modern arguer. `ps-024` scored
5 of 10 with no modern year anywhere in it. The script's `ANCIENT` set exists for exactly this
distinction, sources FOR the subject against arguers ABOUT it, and it stops at antiquity. **Do not widen
it and do not reach for `EXEMPT`**: the flag is usually telling the truth about the PROSE even when it is
wrong about the rule, since a card naming its philosopher in five of ten sentences is a roll-call.
`ps-024` was fixed by replacing two of the five names with "that account" and "the Essay itself", which
took it to 3 of 10 and reads better. Write with pronouns and the work's own title, and the measure and
the prose agree.

**About forty of the thousand cards have a person as their answer, and three-quarters of those are in
deck 1**, where the founders are the history of the subject. That is a fact about the plan rather than a
budget: the number comes from what the subject needs, which is what the two-scholar cap was reaching for
and could not express here.

## Names, terms and figures

**British spelling, like the rest of the site** — behaviour, colour, generalisation, analyse. The
`SPELL_PAIRS` machinery renders it in the reader's own convention, so authored prose is British and
nothing has to be written twice. Two traps in this subject: `behavior` appears inside real proper names
that must NOT be respelled — the journal titles, *Verbal Behavior* at `ps-085`, the Journal of Applied
Behavior Analysis — and those live in citations, which the transform already skips. And **`practice` and
`licence` are one-way rows** in that table, which matters for the clinical deck more than anywhere else
on the site.

**Both diagnostic classifications are named, every time.** DSM-5-TR and ICD-11, with the edition stated:
a criterion that changed between editions is a fact about the classification and not about the disorder,
and citing "the DSM" without a number is how a card comes to assert a criterion that was withdrawn.

**A person's dates go on the card, and a study's date is the publication year.** The date line follows
the house rules in `.claude/date-line.js`: `Lived` for a person, `Published` for a study, `Proposed` for
a theory. **`Published` and `Named` are the discovery labels the history plans forbid, and here they are
correct** — a study is a modern act, which is the exemption those plans already carry.

**Statistics are quoted with their uncertainty or not at all.** A correlation is given with its sample
size, an effect size with its interval, a prevalence with its range and whose it is. A bare number in
this subject is almost always a number somebody rounded off a distribution.

**Where a term has a technical sense and an everyday one, the card says so in its first sentence.**
*Reinforcement* is not reward, *negative reinforcement* is not punishment, *significant* is not
important, *bias* is not prejudice, *regression* is not going backwards. Half the reader's difficulty
with this subject is words they already think they know, and `ps-010` cards that fact directly.

## Sourcing

**Better served than any history collection, and worse than it looks.** The scholarship is enormous,
recent and largely online; what is hard is that the most quotable version of a finding is often the
version that failed to replicate.

**The open routes that work.** PubMed Central and Europe PMC carry a great deal of the biological and
clinical literature in full; PLOS, Frontiers and the other open-access publishers carry much of the
rest; PsyArXiv and OSF carry preprints, registrations and the replication projects' own materials;
Cochrane and NICE carry the treatment evidence; NIMH and the NHS carry serviceable descriptive pages for
the disorders. For the conceptual cards — consciousness, the mind–body problem, free will, what a mental
state is — the **Stanford Encyclopedia of Philosophy** is the right source and it passes the glossary
pass's encyclopedia test outright: every article is signed and carries a bibliography, which is the
per-article test `docs/glossary-citation-plan.md` settled on. For deck 1 the primary texts are mostly
out of copyright and mostly digitised: **Classics in the History of Psychology** (York University) has
Wundt, James, Watson, Thorndike, Ebbinghaus, Yerkes and Dodson in full, and a founder's own words are a
better citation for what they claimed than any secondary account.

**Four hazards, and the first is specific to this discipline.**

**The textbook version of a finding is frequently the version that failed.** Ego depletion, facial
feedback, social priming, the Stanford prison experiment, stereotype threat and the marshmallow test are
all still taught in the form that did not survive. **Check the replication record before citing the
original**, not after: the multi-lab projects (Many Labs, the Reproducibility Project, the Registered
Replication Reports) are open, and they are the fastest way to find out whether a famous result stands.

**A preprint is not a peer-reviewed paper and must be labelled as one.** PsyArXiv is genuinely useful
here and a card citing it says so in the citation, exactly as the `[Open access]` / `[Paywalled]` chips
already say what a reader will meet.

**This discipline has a retraction record.** Where a claim is surprising and rests on one author's body
of work, check it — the notorious cases are notorious precisely because the work looked excellent for
years. A citation that cannot be checked is not a citation, which is already the house rule.

**Popular summaries of psychology are not sources and neither is the press release.** The gap between a
university press release and the paper it describes is a documented research literature in itself.
Follow the DOI.

## Living beside the other collections

**World History carries the science of mind at survey altitude and never waits for this collection.**
The rule in `docs/world-history-card-plan.md` cuts both ways: ten sentences on Freud in a survey deck is
a different card from ten sentences on the structural model of the mind.

**The United States collection touches this one at three points** — the mental testing of immigrants,
the mid-century behaviourism that reached education and advertising, and deinstitutionalisation — and
each of those is a policy card there and a psychology card here. Write the pair deliberately: the same
event, the two questions it answers.

**The glossary collision check was run when this plan was written and came back clean.** Every
psychology term this collection will want as a head word — *extinction*, *memory*, *attention*,
*association*, *conditioning*, *attachment*, *depression*, *stress*, *priming*, *reinforcement*,
*plasticity*, *consciousness*, *trait*, *sensitisation* — is currently in neither `GLOSSARY` nor
`GLOSSARY_ALIASES`. That will not stay true as the glossary grows, so **re-run the check before writing
a term, not before writing the batch**. Three of those words are also ordinary English and will need
`GLOSSARY_CASESENSITIVE` or a narrower head word, exactly as `Boreal` did: *extinction* already means
something else on this site's prehistory cards, *association* means something else in ordinary prose,
and *depression* is already both a landform (the Danakil and Upemba Depressions) and an economic
slump in the presidential terms.

**The first collision arrived at `ps-027` and was resolved by NARROWING THE KEY, not by aliasing.** The
psychology sense of *nativism* is `Psychological_nativism` on Wikipedia; the bare word is the political
one, and the United States collection already plans `us-732 Nativism in the Gilded Age`. So the term is
keyed `Psychological_nativism`, whose only auto-link surface is the two-word phrase, and **neither
"nativism" nor "nativist" is aliased**, which leaves the card's own answer term unlinked and is the right
trade: an alias would have pointed every Gilded Age sentence at a card about innate concepts. Expect the
same shape wherever a psychology word has a political or everyday twin — check Wikipedia's canonical slug
before choosing a key, and count the corpus before adding an alias.

**The card ships with its glossary term, cited at the bar** — the standing rule in
`docs/card-glossary-pairing.md`. This collection starts its vocabulary from nothing, so that rule does
more work here than in any collection since Greece.

# The list

## Foundations and History

### What psychology is — `ps-what`

    ps-001  Psychology
    ps-002  The subject matter of psychology
    ps-003  Behaviour
    ps-004  Mental process
    ps-005  The scientific method in psychology
    ps-006  Levels of explanation in psychology
    ps-007  Basic and applied psychology
    ps-008  The subfields of psychology
    ps-009  Psychology and the other sciences
    ps-010  Psychology and common sense
    ps-011  Nature and nurture
    ps-012  Determinism and free will in psychology
    ps-013  Reductionism
    ps-014  The mind–body problem
    ps-015  Introspection
    ps-016  Objectivity and subjectivity in psychology
    ps-017  Theory in psychology
    ps-018  Hypothesis
    ps-019  Operational definition
    ps-020  Who counts as a psychologist

### Philosophical and physiological roots — `ps-roots`

    ps-021  Empiricism
    ps-022  Rationalism
    ps-023  Associationism
    ps-024  John Locke and the blank slate
    ps-025  René Descartes and dualism
    ps-026  Materialism
    ps-027  Nativism
    ps-028  Immanuel Kant on the possibility of a science of mind
    ps-029  Phrenology
    ps-030  Localisation of function
    ps-031  Paul Broca and Broca's area
    ps-032  Carl Wernicke and the language areas
    ps-033  Johannes Müller and the specific nerve energies
    ps-034  Hermann von Helmholtz
    ps-035  The speed of the nerve impulse
    ps-036  Ernst Weber
    ps-037  Gustav Fechner and psychophysics
    ps-038  Charles Darwin and the descent of mind
    ps-039  Herbert Spencer and evolutionary thinking in psychology
    ps-040  Francis Galton
    ps-041  The first mental tests
    ps-042  Eugenics and early psychology
    ps-043  Wilhelm Griesinger and the somatic view of madness
    ps-044  Mesmerism and animal magnetism
    ps-045  Moral treatment and the nineteenth-century asylum

### The founding schools — `ps-schools`

    ps-046  Wilhelm Wundt
    ps-047  The Leipzig laboratory
    ps-048  Structuralism
    ps-049  Edward Titchener
    ps-050  The imageless thought controversy
    ps-051  Hermann Ebbinghaus
    ps-052  The forgetting curve
    ps-053  William James
    ps-054  The Principles of Psychology
    ps-055  Functionalism
    ps-056  The stream of consciousness
    ps-057  The James–Lange theory
    ps-058  Mary Whiton Calkins
    ps-059  Margaret Floy Washburn
    ps-060  Women in the first generation of psychologists
    ps-061  Ivan Pavlov
    ps-062  Classical conditioning
    ps-063  John B. Watson
    ps-064  Behaviourism
    ps-065  The Little Albert experiment
    ps-066  Edward Thorndike
    ps-067  The law of effect
    ps-068  B. F. Skinner
    ps-069  Radical behaviourism
    ps-070  The operant chamber
    ps-071  Sigmund Freud
    ps-072  Psychoanalysis
    ps-073  The unconscious
    ps-074  The structural model of the mind
    ps-075  Defence mechanisms
    ps-076  Carl Jung
    ps-077  Alfred Adler
    ps-078  Neo-Freudian psychology
    ps-079  Gestalt psychology
    ps-080  Kurt Lewin and field theory

### The cognitive revolution and modern psychology — `ps-modern`

    ps-081  The cognitive revolution
    ps-082  The computer metaphor of mind
    ps-083  Information processing
    ps-084  The magical number seven
    ps-085  Chomsky's review of Verbal Behavior
    ps-086  Ulric Neisser and Cognitive Psychology
    ps-087  Donald Broadbent
    ps-088  Cybernetics and psychology
    ps-089  Artificial intelligence and psychology
    ps-090  Cognitive science
    ps-091  Cognitive neuroscience
    ps-092  Humanistic psychology
    ps-093  Carl Rogers
    ps-094  Abraham Maslow
    ps-095  Existential psychology
    ps-096  Positive psychology
    ps-097  Evolutionary psychology
    ps-098  Sociobiology and its critics
    ps-099  Cross-cultural psychology
    ps-100  Cultural psychology
    ps-101  The WEIRD samples problem
    ps-102  Indigenous psychologies
    ps-103  Feminist psychology
    ps-104  Critical psychology
    ps-105  The biopsychosocial model
    ps-106  Behavioural economics
    ps-107  The rise of neuroscience within psychology
    ps-108  Computational modelling of behaviour
    ps-109  Big data and psychological research
    ps-110  Psychology as a profession today

## Research Methods and Statistics

### Research designs — `ps-design`

    ps-111  The psychological experiment
    ps-112  Independent and dependent variables
    ps-113  Confounding variables
    ps-114  Random assignment
    ps-115  The control group
    ps-116  Between-subjects and within-subjects designs
    ps-117  Counterbalancing
    ps-118  The placebo effect
    ps-119  The double-blind procedure
    ps-120  Demand characteristics
    ps-121  Experimenter expectancy effects
    ps-122  The Hawthorne effect
    ps-123  Quasi-experimental designs
    ps-124  Correlational research
    ps-125  Correlation and causation
    ps-126  The third-variable problem
    ps-127  Longitudinal research
    ps-128  Cross-sectional research
    ps-129  Cohort effects
    ps-130  The case study
    ps-131  Naturalistic observation
    ps-132  Survey research
    ps-133  Sampling
    ps-134  Random sampling
    ps-135  Convenience sampling
    ps-136  Response bias
    ps-137  Social desirability bias
    ps-138  Single-case experimental designs
    ps-139  Field experiments
    ps-140  Meta-analysis

### Measurement and psychometrics — `ps-measure`

    ps-141  Measurement in psychology
    ps-142  Scales of measurement
    ps-143  Reliability
    ps-144  Test–retest reliability
    ps-145  Internal consistency
    ps-146  Cronbach's alpha
    ps-147  Inter-rater reliability
    ps-148  Validity
    ps-149  Construct validity
    ps-150  Content validity
    ps-151  Criterion validity
    ps-152  Face validity
    ps-153  Internal validity
    ps-154  External validity
    ps-155  Ecological validity
    ps-156  Standardisation
    ps-157  Test norms
    ps-158  Item response theory
    ps-159  Classical test theory
    ps-160  Factor analysis
    ps-161  Psychometrics
    ps-162  Self-report measures
    ps-163  Implicit measures
    ps-164  Behavioural measures
    ps-165  Physiological measures

### Statistics and inference — `ps-stats`

    ps-166  Descriptive statistics
    ps-167  Mean, median and mode
    ps-168  Variance and standard deviation
    ps-169  The normal distribution
    ps-170  Skewness
    ps-171  The z score
    ps-172  Percentile
    ps-173  The correlation coefficient
    ps-174  Linear regression
    ps-175  Multiple regression
    ps-176  Inferential statistics
    ps-177  The null hypothesis
    ps-178  Statistical significance
    ps-179  The p value
    ps-180  What a p value does not mean
    ps-181  Type I and Type II errors
    ps-182  Statistical power
    ps-183  Effect size
    ps-184  Cohen's d
    ps-185  Confidence intervals
    ps-186  The t test
    ps-187  Analysis of variance
    ps-188  The chi-squared test
    ps-189  Non-parametric tests
    ps-190  The multiple comparisons problem
    ps-191  Bayesian statistics in psychology
    ps-192  The Bayes factor
    ps-193  Structural equation modelling
    ps-194  Mediation and moderation
    ps-195  Graphing psychological data

### Ethics, integrity and the replication crisis — `ps-ethics`

    ps-196  Research ethics in psychology
    ps-197  Informed consent
    ps-198  Deception in research
    ps-199  Debriefing
    ps-200  The right to withdraw
    ps-201  Confidentiality and anonymity
    ps-202  Ethical review boards
    ps-203  The Belmont Report
    ps-204  The APA ethics code
    ps-205  Animal research in psychology
    ps-206  The Monster Study
    ps-207  The Stanford prison experiment
    ps-208  What the Stanford prison experiment is now thought to show
    ps-209  The Milgram obedience experiments
    ps-210  The ethics of the Milgram experiments
    ps-211  The replication crisis
    ps-212  The Reproducibility Project: Psychology
    ps-213  Questionable research practices
    ps-214  p-hacking
    ps-215  The garden of forking paths
    ps-216  HARKing
    ps-217  Publication bias
    ps-218  The file drawer problem
    ps-219  Preregistration and registered reports
    ps-220  Open science in psychology

## Biological Psychology

### Neurons and neurotransmission — `ps-neuron`

    ps-221  The neuron
    ps-222  Glial cells
    ps-223  The axon
    ps-224  Dendrites
    ps-225  The myelin sheath
    ps-226  The resting potential
    ps-227  The action potential
    ps-228  Saltatory conduction
    ps-229  The synapse
    ps-230  Neurotransmitters
    ps-231  Receptors and ligands
    ps-232  Reuptake
    ps-233  Excitatory and inhibitory postsynaptic potentials
    ps-234  Acetylcholine
    ps-235  Dopamine
    ps-236  Serotonin
    ps-237  Noradrenaline
    ps-238  GABA
    ps-239  Glutamate
    ps-240  Endorphins
    ps-241  Neuromodulation
    ps-242  Agonists and antagonists
    ps-243  The blood–brain barrier
    ps-244  Neural plasticity
    ps-245  Neurogenesis

### The nervous system and the brain — `ps-brain`

    ps-246  The nervous system
    ps-247  The central nervous system
    ps-248  The peripheral nervous system
    ps-249  The autonomic nervous system
    ps-250  The sympathetic nervous system
    ps-251  The parasympathetic nervous system
    ps-252  The spinal cord
    ps-253  The reflex arc
    ps-254  The brainstem
    ps-255  The medulla oblongata
    ps-256  The pons
    ps-257  The reticular formation
    ps-258  The cerebellum
    ps-259  The thalamus
    ps-260  The hypothalamus
    ps-261  The limbic system
    ps-262  The amygdala
    ps-263  The hippocampus
    ps-264  The basal ganglia
    ps-265  The cerebral cortex
    ps-266  The frontal lobe
    ps-267  The prefrontal cortex
    ps-268  The motor cortex
    ps-269  The parietal lobe
    ps-270  The somatosensory cortex
    ps-271  The temporal lobe
    ps-272  The occipital lobe
    ps-273  The corpus callosum
    ps-274  Cerebral lateralisation
    ps-275  Split-brain research
    ps-276  The left-brain right-brain myth
    ps-277  Phineas Gage
    ps-278  Patient H.M.
    ps-279  Aphasia
    ps-280  Brain injury and recovery

### Methods in neuroscience — `ps-neuromethods`

    ps-281  The lesion method
    ps-282  Electroencephalography
    ps-283  Event-related potentials
    ps-284  Single-cell recording
    ps-285  Positron emission tomography
    ps-286  Magnetic resonance imaging
    ps-287  Functional magnetic resonance imaging
    ps-288  The BOLD signal
    ps-289  Diffusion tensor imaging
    ps-290  Magnetoencephalography
    ps-291  Transcranial magnetic stimulation
    ps-292  Optogenetics
    ps-293  Functional near-infrared spectroscopy
    ps-294  The reverse inference problem
    ps-295  The dead salmon study
    ps-296  Thresholding and false positives in neuroimaging
    ps-297  Connectomics
    ps-298  Animal models in neuroscience
    ps-299  Neuropsychological assessment
    ps-300  Double dissociation

### Genes, evolution and behaviour — `ps-genes`

    ps-301  Behavioural genetics
    ps-302  Heritability
    ps-303  What a heritability estimate does not mean
    ps-304  Twin studies
    ps-305  The Minnesota Study of Twins Reared Apart
    ps-306  Adoption studies
    ps-307  Gene–environment interaction
    ps-308  Gene–environment correlation
    ps-309  Epigenetics
    ps-310  Candidate gene studies and why they failed
    ps-311  Genome-wide association studies
    ps-312  Polygenic scores
    ps-313  Natural selection and behaviour
    ps-314  Sexual selection
    ps-315  Inclusive fitness
    ps-316  Kin selection
    ps-317  Reciprocal altruism
    ps-318  The just-so story problem
    ps-319  Comparative psychology
    ps-320  Ethology

### Hormones, drugs and altered states — `ps-hormones`

    ps-321  The endocrine system
    ps-322  The pituitary gland
    ps-323  Cortisol
    ps-324  The HPA axis
    ps-325  Testosterone and behaviour
    ps-326  Oxytocin
    ps-327  Psychoactive drugs
    ps-328  Tolerance and withdrawal
    ps-329  Stimulants
    ps-330  Depressants
    ps-331  Alcohol and the brain
    ps-332  Opioids
    ps-333  Hallucinogens
    ps-334  Cannabis and cognition
    ps-335  The brain's reward system and addiction

## Sensation and Perception

### Sensation and psychophysics — `ps-sensation`

    ps-336  Sensation
    ps-337  Perception
    ps-338  Transduction
    ps-339  Psychophysics
    ps-340  The absolute threshold
    ps-341  The difference threshold
    ps-342  Weber's law
    ps-343  Fechner's law
    ps-344  Stevens's power law
    ps-345  Signal detection theory
    ps-346  Sensory adaptation
    ps-347  Sensory receptors
    ps-348  Subliminal perception
    ps-349  Bottom-up and top-down processing
    ps-350  Perceptual set
    ps-351  Sensory coding
    ps-352  Labelled lines in the senses
    ps-353  Cross-modal perception
    ps-354  Synaesthesia
    ps-355  Sensory deprivation

### Vision — `ps-vision`

    ps-356  Light as a visual stimulus
    ps-357  The eye
    ps-358  The cornea and the lens
    ps-359  Accommodation
    ps-360  The retina
    ps-361  Rods and cones
    ps-362  The fovea
    ps-363  Dark adaptation
    ps-364  The blind spot
    ps-365  The optic nerve and the optic chiasm
    ps-366  The lateral geniculate nucleus
    ps-367  The primary visual cortex
    ps-368  Receptive fields
    ps-369  Cortical feature cells
    ps-370  The ventral and dorsal visual streams
    ps-371  Feature detection
    ps-372  Colour vision
    ps-373  Trichromatic theory
    ps-374  Opponent-process theory of colour
    ps-375  Colour blindness
    ps-376  Colour constancy
    ps-377  Lightness constancy
    ps-378  Depth perception
    ps-379  Binocular disparity
    ps-380  Monocular depth cues
    ps-381  Motion perception
    ps-382  Apparent motion
    ps-383  Visual agnosia
    ps-384  Prosopagnosia
    ps-385  The fusiform face area
    ps-386  Blindsight
    ps-387  Object recognition
    ps-388  Theories of pattern recognition
    ps-389  Visual search
    ps-390  Change blindness

### Hearing and the other senses — `ps-hearing`

    ps-391  Sound as an auditory stimulus
    ps-392  The ear
    ps-393  The cochlea
    ps-394  The basilar membrane
    ps-395  Place theory of pitch
    ps-396  Frequency and volley theories of pitch
    ps-397  The auditory cortex
    ps-398  Sound localisation
    ps-399  Deafness and hearing loss
    ps-400  Auditory scene analysis
    ps-401  Speech perception
    ps-402  The McGurk effect
    ps-403  The chemical senses
    ps-404  Olfaction
    ps-405  Taste
    ps-406  Flavour
    ps-407  Touch and the skin senses
    ps-408  Pain
    ps-409  Gate control theory of pain
    ps-410  The vestibular and proprioceptive senses

### Perceptual organisation and illusions — `ps-perc-org`

    ps-411  Perceptual organisation
    ps-412  The Gestalt principles of grouping
    ps-413  Figure and ground
    ps-414  Perceptual constancy
    ps-415  The Ponzo illusion
    ps-416  The Müller-Lyer illusion
    ps-417  The Ames room
    ps-418  The moon illusion
    ps-419  Ambiguous figures
    ps-420  Impossible figures
    ps-421  What illusions reveal about perception
    ps-422  Culture and perception
    ps-423  Perceptual learning
    ps-424  Perceptual development in infancy
    ps-425  The visual cliff

## Learning, Memory and Cognition

### Conditioning and learning — `ps-learning`

    ps-426  Learning
    ps-427  Habituation
    ps-428  Sensitisation
    ps-429  Classical conditioning procedures
    ps-430  Unconditioned and conditioned stimuli
    ps-431  Acquisition
    ps-432  Extinction
    ps-433  Spontaneous recovery
    ps-434  Generalisation and discrimination
    ps-435  Second-order conditioning
    ps-436  Conditioned taste aversion
    ps-437  Biological preparedness
    ps-438  The Rescorla–Wagner model
    ps-439  Contingency and contiguity
    ps-440  Operant conditioning
    ps-441  Reinforcement
    ps-442  Positive and negative reinforcement
    ps-443  Punishment
    ps-444  Shaping
    ps-445  Schedules of reinforcement
    ps-446  The partial reinforcement extinction effect
    ps-447  Primary and secondary reinforcers
    ps-448  Token economies
    ps-449  Avoidance and escape learning
    ps-450  Learned helplessness
    ps-451  What learned helplessness turned out to be
    ps-452  Instinctive drift
    ps-453  Latent learning
    ps-454  Cognitive maps
    ps-455  Observational learning
    ps-456  Albert Bandura and social learning theory
    ps-457  The Bobo doll experiments
    ps-458  Insight learning
    ps-459  Behaviour modification
    ps-460  Applied behaviour analysis

### Memory — `ps-memory`

    ps-461  Memory
    ps-462  Encoding, storage and retrieval
    ps-463  Sensory memory
    ps-464  Iconic memory
    ps-465  Echoic memory
    ps-466  Short-term memory
    ps-467  The multi-store model of memory
    ps-468  Chunking
    ps-469  The serial position effect
    ps-470  Working memory
    ps-471  The phonological loop
    ps-472  The visuospatial sketchpad
    ps-473  The central executive
    ps-474  The episodic buffer
    ps-475  Long-term memory
    ps-476  Declarative and non-declarative memory
    ps-477  Episodic memory
    ps-478  Semantic memory
    ps-479  Procedural memory
    ps-480  Priming
    ps-481  Levels of processing
    ps-482  Elaborative rehearsal
    ps-483  Retrieval cues
    ps-484  Encoding specificity
    ps-485  Context-dependent memory
    ps-486  State-dependent memory
    ps-487  Recall and recognition
    ps-488  Forgetting
    ps-489  Decay and interference
    ps-490  Proactive and retroactive interference
    ps-491  Motivated forgetting
    ps-492  Amnesia
    ps-493  Anterograde and retrograde amnesia
    ps-494  Memory consolidation
    ps-495  Reconsolidation
    ps-496  Memory as reconstruction
    ps-497  Schemas and remembering
    ps-498  Eyewitness testimony
    ps-499  The misinformation effect
    ps-500  The recovered memory controversy

### Attention and consciousness — `ps-attention`

    ps-501  Attention
    ps-502  Selective attention
    ps-503  The cocktail party effect
    ps-504  Dichotic listening
    ps-505  Filter theories of attention
    ps-506  Attenuation theory
    ps-507  Late-selection theories
    ps-508  Divided attention
    ps-509  Automatic and controlled processing
    ps-510  The Stroop effect
    ps-511  Attentional capture
    ps-512  Inattentional blindness
    ps-513  The invisible gorilla experiment
    ps-514  Sustained attention and vigilance
    ps-515  Multitasking
    ps-516  Consciousness
    ps-517  Theories of consciousness
    ps-518  The hard problem of consciousness
    ps-519  The neural correlates of consciousness
    ps-520  Sleep
    ps-521  The stages of sleep
    ps-522  REM sleep and dreaming
    ps-523  Theories of dreaming
    ps-524  Sleep deprivation
    ps-525  Hypnosis

### Thinking, reasoning and decision-making — `ps-thinking`

    ps-526  Thinking
    ps-527  Concepts and categories
    ps-528  Prototype theory
    ps-529  Mental imagery
    ps-530  Problem solving
    ps-531  Algorithms and heuristics
    ps-532  Functional fixedness
    ps-533  Mental set
    ps-534  Insight and incubation
    ps-535  Expertise
    ps-536  Deductive reasoning
    ps-537  The Wason selection task
    ps-538  Inductive reasoning
    ps-539  Belief bias
    ps-540  Judgement under uncertainty
    ps-541  The availability heuristic
    ps-542  The representativeness heuristic
    ps-543  The conjunction fallacy
    ps-544  Base rate neglect
    ps-545  Anchoring and adjustment
    ps-546  Framing effects
    ps-547  Prospect theory
    ps-548  Loss aversion
    ps-549  The sunk cost fallacy
    ps-550  Confirmation bias
    ps-551  Overconfidence
    ps-552  Dual-process theories of thinking
    ps-553  Bounded rationality
    ps-554  Fast and frugal heuristics
    ps-555  Nudges and choice architecture

### Language — `ps-language`

    ps-556  Language
    ps-557  The design features of human language
    ps-558  Phonemes and morphemes
    ps-559  Syntax
    ps-560  Semantics and pragmatics
    ps-561  Language acquisition
    ps-562  The critical period for language
    ps-563  The poverty of the stimulus argument
    ps-564  Universal grammar and its critics
    ps-565  Language and thought
    ps-566  The Sapir–Whorf hypothesis
    ps-567  Bilingualism
    ps-568  Reading and dyslexia
    ps-569  Ape language studies
    ps-570  The neuroscience of language

## Development across the Lifespan

### Infancy and early childhood — `ps-dev-early`

    ps-571  Developmental psychology
    ps-572  Prenatal development
    ps-573  Teratogens
    ps-574  What a newborn can do
    ps-575  Neonatal reflexes
    ps-576  Infant perception
    ps-577  Preferential looking
    ps-578  Habituation methods in infancy
    ps-579  Motor development
    ps-580  Maturation
    ps-581  Sensitive periods in development
    ps-582  Temperament
    ps-583  Attachment
    ps-584  John Bowlby and attachment theory
    ps-585  The Strange Situation
    ps-586  Attachment classifications
    ps-587  Harry Harlow's monkey studies
    ps-588  Maternal deprivation
    ps-589  The Romanian orphan studies
    ps-590  Fathers and other caregivers
    ps-591  Day care and development
    ps-592  Parenting styles
    ps-593  Early language development
    ps-594  Babbling and first words
    ps-595  Vocabulary growth
    ps-596  Play
    ps-597  Self-recognition and the mirror test
    ps-598  Gender development in childhood
    ps-599  Early childhood education and its effects
    ps-600  Risk and resilience

### Cognitive development — `ps-dev-cog`

    ps-601  Jean Piaget
    ps-602  Piaget's theory of cognitive development
    ps-603  Schemas, assimilation and accommodation
    ps-604  The sensorimotor stage
    ps-605  Object permanence
    ps-606  The preoperational stage
    ps-607  Egocentrism
    ps-608  Conservation
    ps-609  The concrete operational stage
    ps-610  The formal operational stage
    ps-611  Criticisms of Piaget
    ps-612  Lev Vygotsky
    ps-613  The zone of proximal development
    ps-614  Scaffolding
    ps-615  Private speech
    ps-616  Information-processing accounts of development
    ps-617  Theory of mind
    ps-618  The false-belief task
    ps-619  Core knowledge
    ps-620  Infant numerical cognition
    ps-621  Executive function in childhood
    ps-622  Memory development
    ps-623  Metacognition
    ps-624  Cognitive development and schooling
    ps-625  Cross-cultural studies of cognitive development

### Social and moral development — `ps-dev-social`

    ps-626  Social development
    ps-627  Erik Erikson's psychosocial stages
    ps-628  Identity formation
    ps-629  The developing self-concept
    ps-630  Emotional development
    ps-631  Emotion regulation in childhood
    ps-632  Social referencing
    ps-633  Peer relationships
    ps-634  Friendship in childhood
    ps-635  Peer rejection and bullying
    ps-636  Prosocial behaviour in children
    ps-637  The development of aggression
    ps-638  Moral development
    ps-639  Kohlberg's stages of moral reasoning
    ps-640  Criticisms of Kohlberg
    ps-641  Carol Gilligan and the ethic of care
    ps-642  Moral emotions in children
    ps-643  Socialisation
    ps-644  The shared environment puzzle
    ps-645  Sibling relationships
    ps-646  Media and children's development
    ps-647  Culture and child-rearing
    ps-648  Poverty and development
    ps-649  Child maltreatment and its effects
    ps-650  Developmental psychopathology

### Adolescence, adulthood and ageing — `ps-dev-later`

    ps-651  Adolescence
    ps-652  Puberty
    ps-653  The adolescent brain
    ps-654  Risk-taking in adolescence
    ps-655  Peer influence in adolescence
    ps-656  Emerging adulthood
    ps-657  Adult cognitive development
    ps-658  Abilities across the lifespan
    ps-659  Continuity of attachment into adulthood
    ps-660  Work and the adult life course
    ps-661  Parenthood
    ps-662  Midlife
    ps-663  Ageing
    ps-664  Cognitive ageing
    ps-665  Successful ageing
    ps-666  Socioemotional selectivity theory
    ps-667  Dementia and normal ageing
    ps-668  Wisdom
    ps-669  Death, dying and bereavement
    ps-670  Lifespan development as a field

## Emotion, Motivation and Individual Differences

### Emotion — `ps-emotion`

    ps-671  Emotion
    ps-672  The components of an emotion
    ps-673  Basic emotions
    ps-674  Paul Ekman and facial expressions
    ps-675  Are facial expressions universal
    ps-676  The facial feedback hypothesis
    ps-677  Display rules
    ps-678  Physiological theories of emotion
    ps-679  The Cannon–Bard theory
    ps-680  The Schachter–Singer two-factor theory
    ps-681  Appraisal theories of emotion
    ps-682  The theory of constructed emotion
    ps-683  The amygdala and fear
    ps-684  Fear conditioning
    ps-685  The autonomic signature of emotion
    ps-686  Emotion and memory
    ps-687  Flashbulb memories
    ps-688  Mood and cognition
    ps-689  Emotion regulation
    ps-690  Cognitive reappraisal
    ps-691  Expressive suppression
    ps-692  Affective forecasting
    ps-693  Subjective wellbeing
    ps-694  The hedonic treadmill
    ps-695  Emotional intelligence
    ps-696  Culture and emotion
    ps-697  Disgust
    ps-698  Anger
    ps-699  Sadness and grief
    ps-700  Measuring emotion

### Motivation — `ps-motivation`

    ps-701  Motivation
    ps-702  Instinct theories of motivation
    ps-703  Drive reduction theory
    ps-704  Homeostasis
    ps-705  The Yerkes–Dodson law
    ps-706  Incentive and reward
    ps-707  Intrinsic and extrinsic motivation
    ps-708  The overjustification effect
    ps-709  Self-determination theory
    ps-710  Achievement motivation
    ps-711  Goal setting
    ps-712  Expectancy-value theories
    ps-713  Self-efficacy
    ps-714  Delay of gratification
    ps-715  The marshmallow test and what replication showed
    ps-716  Hunger and eating
    ps-717  Thirst and the regulatory drives
    ps-718  Sexual motivation
    ps-719  Maslow's hierarchy of needs and its evidence
    ps-720  Ego depletion

### Personality — `ps-personality`

    ps-721  Personality
    ps-722  Trait theories of personality
    ps-723  Gordon Allport
    ps-724  Cattell's sixteen factors
    ps-725  Eysenck's dimensions
    ps-726  The Big Five
    ps-727  Openness to experience
    ps-728  Conscientiousness
    ps-729  Extraversion
    ps-730  Agreeableness
    ps-731  Neuroticism
    ps-732  The HEXACO model
    ps-733  Personality inventories
    ps-734  The MMPI
    ps-735  The Myers-Briggs Type Indicator and why psychologists distrust it
    ps-736  Projective tests
    ps-737  The Rorschach inkblot test
    ps-738  The Thematic Apperception Test
    ps-739  The Barnum effect
    ps-740  Psychodynamic accounts of personality
    ps-741  Psychosexual stages
    ps-742  Object relations theory
    ps-743  Humanistic accounts of personality
    ps-744  Congruence and the self-concept
    ps-745  Social-cognitive accounts of personality
    ps-746  The person–situation debate
    ps-747  Situational strength
    ps-748  Personality stability and change
    ps-749  The heritability of personality
    ps-750  Personality and life outcomes
    ps-751  The dark triad
    ps-752  Narcissism
    ps-753  Self-esteem
    ps-754  Personality structure across cultures
    ps-755  Idiographic and nomothetic approaches

### Intelligence and its testing — `ps-intelligence`

    ps-756  Intelligence
    ps-757  Alfred Binet and the first intelligence scale
    ps-758  The intelligence quotient
    ps-759  The Stanford–Binet scales
    ps-760  The Wechsler scales
    ps-761  The IQ distribution
    ps-762  Spearman's g
    ps-763  Thurstone's primary mental abilities
    ps-764  The Cattell–Horn–Carroll model
    ps-765  Fluid and crystallised intelligence
    ps-766  Multiple intelligences and the evidence
    ps-767  The triarchic theory of intelligence
    ps-768  Creativity
    ps-769  Divergent thinking tests
    ps-770  The Flynn effect
    ps-771  Group differences in test scores
    ps-772  Stereotype threat and its replication record
    ps-773  Test bias
    ps-774  The heritability of intelligence
    ps-775  Intelligence and education
    ps-776  Intellectual disability
    ps-777  Giftedness
    ps-778  Cognitive training and the transfer problem
    ps-779  The learning styles myth
    ps-780  What intelligence tests do and do not measure

## Social Psychology

### The self and social cognition — `ps-social-self`

    ps-781  Social psychology
    ps-782  The self in social psychology
    ps-783  Self-schema
    ps-784  Self-awareness
    ps-785  Self-presentation
    ps-786  Impression management
    ps-787  The self-serving bias
    ps-788  Self-verification and self-enhancement
    ps-789  Social comparison theory
    ps-790  Social cognition
    ps-791  Attribution
    ps-792  The correspondence bias
    ps-793  The fundamental attribution error and its limits
    ps-794  The actor–observer asymmetry
    ps-795  Attribution across cultures
    ps-796  Schemas and social knowledge
    ps-797  Heuristics in social judgement
    ps-798  The halo effect
    ps-799  Impression formation
    ps-800  Thin slices and first impressions
    ps-801  Expectancy confirmation
    ps-802  The self-fulfilling prophecy
    ps-803  Pygmalion in the classroom and what it showed
    ps-804  Stereotypes as cognitive structures
    ps-805  Implicit social cognition
    ps-806  The Implicit Association Test and the argument about it
    ps-807  Social priming and the replication record
    ps-808  Mind perception
    ps-809  Empathy and perspective-taking
    ps-810  Culture and the self

### Attitudes and social influence — `ps-influence`

    ps-811  Attitudes
    ps-812  Measuring attitudes
    ps-813  Attitudes and behaviour
    ps-814  The theory of planned behaviour
    ps-815  Persuasion
    ps-816  The elaboration likelihood model
    ps-817  Source credibility
    ps-818  Fear appeals
    ps-819  Cognitive dissonance
    ps-820  The induced compliance experiment
    ps-821  Self-perception theory
    ps-822  Resistance to persuasion
    ps-823  Inoculation theory
    ps-824  Conformity
    ps-825  The Asch conformity experiments
    ps-826  Normative and informational influence
    ps-827  The autokinetic studies
    ps-828  Minority influence
    ps-829  Obedience to authority
    ps-830  What the Milgram experiments are now taken to show
    ps-831  Compliance techniques
    ps-832  Foot-in-the-door and door-in-the-face
    ps-833  Reciprocity as a social rule
    ps-834  Norm perception and pluralistic ignorance
    ps-835  Bystander intervention
    ps-836  The Kitty Genovese case and the bystander story
    ps-837  Diffusion of responsibility
    ps-838  Deindividuation
    ps-839  Social facilitation
    ps-840  Social loafing

### Groups, prejudice and intergroup relations — `ps-groups`

    ps-841  Groups
    ps-842  Group norms and roles
    ps-843  Group cohesion
    ps-844  Group decision-making
    ps-845  Group polarisation
    ps-846  Groupthink
    ps-847  Leadership
    ps-848  Power and status
    ps-849  Social identity theory
    ps-850  The minimal group paradigm
    ps-851  Self-categorisation theory
    ps-852  Ingroup favouritism
    ps-853  Prejudice
    ps-854  Measuring stereotypes
    ps-855  Discrimination
    ps-856  Realistic conflict theory
    ps-857  The Robbers Cave experiment
    ps-858  The contact hypothesis
    ps-859  Conditions for successful intergroup contact
    ps-860  Modern and subtle prejudice
    ps-861  Race and psychological research
    ps-862  Sexism and gender stereotypes
    ps-863  The Blue eyes/Brown eyes exercise
    ps-864  Dehumanisation
    ps-865  Collective action
    ps-866  Intergroup emotions
    ps-867  What reduces prejudice
    ps-868  Cooperation and competition
    ps-869  Social dilemmas
    ps-870  Trust

### Relationships, helping and aggression — `ps-relations`

    ps-871  Interpersonal attraction
    ps-872  Proximity and the mere exposure effect
    ps-873  Physical attractiveness
    ps-874  Similarity and attraction
    ps-875  Love
    ps-876  The triangular theory of love
    ps-877  Attachment styles in adult relationships
    ps-878  Relationship satisfaction and conflict
    ps-879  Relationship dissolution
    ps-880  Loneliness
    ps-881  Social support
    ps-882  Prosocial behaviour
    ps-883  Altruism
    ps-884  The empathy–altruism hypothesis
    ps-885  Volunteering and charitable giving
    ps-886  Aggression
    ps-887  The frustration–aggression hypothesis
    ps-888  Media violence and aggression
    ps-889  Situational triggers of aggression
    ps-890  Reducing aggression

## Mental Health and Applied Psychology

### Psychological disorders — `ps-disorders`

    ps-891  Abnormal psychology
    ps-892  Defining psychological disorder
    ps-893  The medical model of mental illness
    ps-894  The diathesis–stress model
    ps-895  Classifying mental disorders
    ps-896  The DSM
    ps-897  The ICD classification of mental disorders
    ps-898  Comorbidity
    ps-899  The critics of diagnosis
    ps-900  The Rosenhan study and the argument about it
    ps-901  Anti-psychiatry
    ps-902  Stigma and mental illness
    ps-903  The epidemiology of mental disorders
    ps-904  Anxiety disorders
    ps-905  Generalised anxiety disorder
    ps-906  Panic disorder
    ps-907  Phobias
    ps-908  Social anxiety disorder
    ps-909  Obsessive-compulsive disorder
    ps-910  Post-traumatic stress disorder
    ps-911  Depressive disorders
    ps-912  Major depressive disorder
    ps-913  Theories of depression
    ps-914  The cognitive theory of depression
    ps-915  Bipolar disorder
    ps-916  Suicide and self-harm
    ps-917  Schizophrenia
    ps-918  Positive and negative symptoms
    ps-919  Theories of schizophrenia
    ps-920  The dopamine hypothesis
    ps-921  Eating disorders
    ps-922  Anorexia nervosa and bulimia nervosa
    ps-923  Substance use disorders
    ps-924  Personality disorders
    ps-925  Borderline personality disorder
    ps-926  Antisocial personality disorder and psychopathy
    ps-927  Autism spectrum disorder
    ps-928  Attention deficit hyperactivity disorder
    ps-929  Neurodevelopmental disorders
    ps-930  Culture and psychopathology

### Assessment and treatment — `ps-therapy`

    ps-931  Clinical psychology
    ps-932  Clinical assessment
    ps-933  The clinical interview
    ps-934  Rating scales in clinical practice
    ps-935  Case formulation
    ps-936  Psychotherapy
    ps-937  Psychodynamic therapy
    ps-938  Free association and transference
    ps-939  Behaviour therapy
    ps-940  Systematic desensitisation
    ps-941  Exposure therapy
    ps-942  Aversion therapy and its problems
    ps-943  Cognitive therapy
    ps-944  Cognitive behavioural therapy
    ps-945  Third-wave therapies
    ps-946  Mindfulness-based interventions
    ps-947  Person-centred therapy
    ps-948  Family and systemic therapy
    ps-949  Group therapy
    ps-950  Therapy outcome research
    ps-951  The dodo bird verdict
    ps-952  Common factors in psychotherapy
    ps-953  The therapeutic alliance
    ps-954  Evidence-based practice
    ps-955  Drug treatment of mental disorders
    ps-956  Antidepressants
    ps-957  Antipsychotics
    ps-958  Electroconvulsive therapy and psychosurgery
    ps-959  Deinstitutionalisation and community care
    ps-960  Digital and remote therapy

### Health, stress and wellbeing — `ps-health`

    ps-961  Health psychology
    ps-962  Stress
    ps-963  The general adaptation syndrome
    ps-964  Life events and daily hassles
    ps-965  Appraisal and coping
    ps-966  Coping strategies
    ps-967  Stress and the immune system
    ps-968  Psychoneuroimmunology
    ps-969  Stress and cardiovascular disease
    ps-970  The Type A behaviour pattern and what became of it
    ps-971  Social support and health
    ps-972  Health behaviour change
    ps-973  Adherence to treatment
    ps-974  Pain management
    ps-975  Placebo and nocebo effects in treatment
    ps-976  Sleep and health
    ps-977  Exercise and mental health
    ps-978  Wellbeing interventions
    ps-979  Socioeconomic status and health
    ps-980  Psychology and public health

### Work, law, education and sport — `ps-work`

    ps-981  Applied psychology
    ps-982  Occupational psychology
    ps-983  Personnel selection
    ps-984  The employment interview and its validity
    ps-985  Work motivation and job design
    ps-986  Job satisfaction
    ps-987  Leadership in organisations
    ps-988  Human factors and ergonomics
    ps-989  Educational psychology
    ps-990  Learning and instruction
    ps-991  The testing effect
    ps-992  Spacing and distributed practice
    ps-993  Desirable difficulties
    ps-994  Forensic psychology
    ps-995  Interrogation and false confessions
    ps-996  Lie detection and the polygraph
    ps-997  Offender profiling and its evidence
    ps-998  Sport psychology
    ps-999  Consumer and economic psychology
    ps-1000  Where psychology is going
