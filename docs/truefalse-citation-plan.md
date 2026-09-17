# Citing True or False

The fourth citation pass, after the cards', the glossary's and the artefacts'. It is the smallest and
the easiest to leave half done, because a True-or-False statement is one sentence and looks as though it
does not need an apparatus.

It does. The explanation is the only thing a reader of that game is ever told about the claim, they meet
it once and never again, and **a bare "True." is exactly the feedback the learning-science batch
measured at d = 0.05** — the weakest thing a test can hand back. What the same review rates highest is
an explanation, so the explanation is where the effort goes, and an explanation that asserts a fact with
nothing behind it is the one thing this site must not produce.

## The bar

**At least one openable source per statement**, cited in the site's Chicago note form and pointed at by
an empty `<sup class="fn" data-fn="N">` marker in the `why`. That is lower than a card's five and lower
than a glossary term's two, deliberately: a statement makes ONE claim, and the second source a card
needs is for its second through tenth sentences.

Everything else is the house rule already written down for cards and glossary terms and is not restated
here — real scholarship, never Wikipedia, never an invented page number, a URL a reader can open, and a
**foreign-language work under its own untranslated title** where it carries what an English one does
not. Read the `sources` bullet under "Add a card" in `CLAUDE.md` before opening a batch.

Two rules are this pool's own:

- **The prose is authored metric-first, in British spelling.** `unitizeTree` and `spellTree` are
  standing observers over the document, so a statement written `100 metres (330 feet)` in `colour` is
  shown to each reader in their own system and spelling — and one written in feet, or in `color`, is
  shown that way to *everybody*, the spelling transform being one-way from authored British.
  `check-truefalse.js` refuses both.
- **A statement may not be cited to a source that does not carry its claim.** This sounds like it goes
  without saying and is the pass's commonest failure: the reusable material here is Folio's own verified
  citations, and a citation reused for a claim it was not written for is the exact fault
  `docs/glossary-citation-plan.md` records three times over.

## Where the material is

**Folio's own corpus first.** A True-or-False statement is usually a claim some card already makes, and
that card's citation was opened, read and checked when the card was written. The recipe:

1. Find the card whose abstract states the claim.
2. Read which MARKER stands on that sentence — `<sup class="fn" data-fn="3">` means source 3.
3. Take source 3's string out of the card's own `sources` array **by index, programmatically**, never by
   retyping it.

`scratchpad/tf/build_n1.py` is that script. **Nothing is retyped**, which is the whole point: a citation
retyped is a citation whose DOI, page range or given name can drift from the one that was verified.

Where the corpus has nothing, the source is researched from scratch and the ordinary rules apply —
verify the DOI against Crossref while drafting (`node .claude/check-citations.js`), curl the URL, and
**read the source's own metadata page before composing an edition or an author list**, a curl being a
check of the address and of nothing else.

## Standing

Run `node .claude/check-truefalse.js` for the figures rather than quoting any here — it reports the
coverage per run. When this file was written the pool stood at **220 statements, 48 of them cited**, and
the cited ones were the whole of the new "Prehistory" category plus what could be lifted out of the
Ancient, Chinese-history, Modern-history, Biology, Earth-science and Medicine cards.

## Batches

Each batch is one category, because a category's statements draw on one part of the corpus and the
card-side research is then shared.

| batch | category | note |
|---|---|---|
| T1 | Prehistory | **done** — written cited |
| T2 | Ancient & classical | part done; T2a, T2b, T2c and T16 between them |
| T3 | Chinese history | part done; `cnh-` cards carry most of it |
| T4 | Modern history | part done; T4a took three and T4b two, the rest blocked by shut hosts |
| T5 | Medieval & early modern | part done; T2c took one out of `wh-511`, T5b one off the National Museum of Denmark |
| T6 | Science & invention | the hardest; T6a took two of fifteen, off Gutenberg and the DOE, T15 three off MacTutor, archive.org and the Nobel Foundation; see the three below |
| T7 | Biology / Medicine | part done; T7a took six, T7b three, T7c two, T7d one, T13 three and T14 one, all researched |
| T8 | Physics / Chemistry / Mathematics | part done; T8a three off NIST, the NWS and Perseus, T8b three off the RSC and Los Alamos periodic tables, T8c three off MacTutor, T12 four more off MacTutor and one off the RSC, T17 one off NOAA |
| T9 | Astronomy / Earth science | part done; T9a four, T9b three and T9c three off NASA, T9d two off a USGS book, T11 four off NASA and NOAA |
| T10 | Psychology | part done; T10a took four, researched; T10b two lifted out of `docs/learning-science.md`; T14 one |

## Open questions carried forward

Five statements are known to need work and are recorded here rather than left to be rediscovered.

- **Claudette Colvin, arrested nine months before Rosa Parks.** Neither National Archives page on Parks
  names her, `loc.gov` and `nmaahc.si.edu` are 403 from here, and the Library of Congress research guide
  that does answer does not mention her. **Left uncited.**
- **George Washington's blood loss, and Napoleon's height.** Both are the imperial-only figures rule 5
  now reports, and neither can be rewritten metric-first without a citation, because `add-truefalse.js`
  rightly refuses a `cite` with no `src`. Europe PMC indexes three papers on Washington's death and all
  three are closed; `napoleon.org` renders its search in JavaScript and the BMJ note on his height is 403.

- **The terracotta army's discovery (1974).** No source openable from this sandbox was found for the
  discovery itself; the statement is uncited.
- **Who built the Giza pyramids.** The obvious sources are Harvard's Giza project
  (`gizamedia.rc.fas.harvard.edu`, 502 through the proxy on every attempt), an ISAC Chicago PDF (404)
  and Cambridge Core (partially down). **Left uncited rather than cited to something unread**, which is
  the right answer and is why it is written down.
- ~~**Gunpowder.**~~ **Settled in T2b by rewriting it**, which is what this file said the honest
  default was. The statement asserted a Tang-dynasty origin and "the earliest known formula in a
  9th-century Taoist text"; `wh-530`'s cited prose gives the *Wujing zongyao* of 1044 and gives the Tang
  connection only as a later Chinese scholar's reading of festival fireworks. A second sweep for an open
  work on the alchemical origin found nothing reachable — OpenAlex rate-limits from here and DOAJ has one
  article on the subject, about Ottoman firearms — and the three open works `wh-530` already cites
  (Mayers 1871, Schlegel 1902, Carter 1925) say nothing about alchemists or an elixir. It now asks
  whether gunpowder was **written about in China before it was used as a weapon**, which is the card's
  own opening sentence, is a better question than the one it replaced, and is cited to the two works
  that carry it.

One correction already made, worth keeping as the shape of the fault: a statement dated papermaking to
the 2nd century BCE, which the card cited for it does not say.

## Writing a batch

Build it in `scratchpad/<batch>/build.py`, emit the writer's own shape —

```json
{ "cite": { "<the statement's exact q>": { "why": "…<sup class=\"fn\" data-fn=\"1\"></sup>", "src": ["…"] } },
  "add":  [ { "q": "…", "a": true, "why": "…", "cat": "…", "src": ["…"] } ] }
```

— and apply it with `node .claude/add-truefalse.js <batch.json>`, which validates everything before
writing a byte and runs the checker afterwards. **The key is the statement's own `q`, never its index**,
so a batch cannot be applied to the wrong statement by a reordering that happened in between.

Then read the finished statements back as a reader: `node .claude/test-truefalse.js`, and the game
itself at `#truefalse`.

## Batch log

### T2a — five lifted straight out of the corpus (2026-09-17)

Five statements cited without a single new search, because Folio already made each claim on a card
and had already opened and checked the work behind it. The recipe in full, and it is the batch's
reusable half:

1. `scratchpad/tf/find.js <regex>` over the card corpus for the claim's own words.
2. `scratchpad/oc/dart.js <card id>` to print that card's sentences WITH the marker numbers standing
   on them, so the source can be read off the sentence rather than guessed from the list.
3. A build script that lifts the citation **by (card id, source index) through `card-io.js`** and
   never retypes it — a retyped citation is one whose DOI, pages or given names can drift from the
   one that was verified.

The five: the Babylonian tablets and Pythagoras (from `wh-194`, three sources), Song paper money
(`wh-529`, two), Bi Sheng and movable type (`wh-532`, two), Ashoka and Kalinga (`wh-386`, two) and
Cleopatra's Macedonian descent (`gr-767`, one).

**THE LIFT IS NOT THE WHOLE JOB, AND TWO CANDIDATES WERE DROPPED ON READING.** A statement is only
citable to a card whose CITED PROSE carries the claim, and twice the card carried a weaker one:

- **Chang'an as the world's most populous city, "around a million people."** `wh-523` says only that
  it was "one of the largest cities anywhere in the world", which is not the statement, and nothing
  else in the corpus gives a figure. **Left uncited, and the statement needs either a source or a
  softer wording** — not a citation to a card that declines to say it.
- **Gunpowder, and this is the sharper case.** Its explanation asserts a Tang-dynasty origin, an
  accidental discovery by alchemists seeking an elixir, and "the earliest formula … in a 9th-century
  CE Taoist text". `wh-530`'s own cited prose says the earliest formulas that SURVIVE are in a
  military encyclopedia presented to the Song throne in **1044**, and gives the Tang connection only
  as a later Chinese scholar's retrospective reading of festival fireworks. A Crossref sweep for an
  open work on the alchemical origin turned up nothing reachable. **So the explanation claims two
  things Folio cannot show, and the honest repair is to rewrite it rather than to attach a source
  that does not bear it out** — which is a content decision and the next batch's first job.

**A CARD'S OWN CAUTION IS WORTH CARRYING ACROSS.** `wh-386` is careful that Ashoka's Kalinga figures
are the king's own count, published by him; the explanation written here says so in the same breath
rather than reporting 100,000 killed as a measured number.

### T2b — seven statements, of which two were rewritten (2026-09-17)

Six came out of the corpus by the T2a recipe and one was researched. The batch: gunpowder (`wh-530`,
above), the Ides of March (`rm-369`), Nero and the fire (`wh-366`), the Library of Alexandria (`wh-335`),
the silkworm eggs (`wh-438`), the Edict of Milan (`wh-372` and a researched pair) and the Olympic games
(`gr-229` and Pausanias).

**TWO STATEMENTS WERE REWRITTEN RATHER THAN CITED, AND THAT IS THE BATCH'S REAL WORK.** Both predate the
apparatus and both asserted, flatly and as TRUE, something Folio's own cited prose declines to say.
Gunpowder is described above. The other is the silkworms: the statement had the secret "guarded in China
on pain of death" and monks hiding eggs "in hollow canes", where `wh-438` is careful that the insects
**probably came from Sogdiana rather than from China itself**, and Maksymiuk's paper — the card's own
source, read for this batch — says so outright and quotes the Greek, in which the monks come *from India*
and report having been in *Serinda*. The canes are not in the passage Maksymiuk quotes at all. The
statement now asks what the record shows (monks, eggs, and an empire freed from buying raw silk through
Persia) and the explanation says in its second sentence where the worms more probably came from.

**`add-truefalse.js` COULD ALREADY REWRITE A `q` AND NOTHING CHECKED IT.** The path existed
(`cite[q].q`) and was undocumented and unvalidated, so an empty rewrite would have left a statement the
game draws with no question on it, and two rewrites landing on one wording would have put the same claim
in the pool twice — neither of which the checker could attribute to the run that caused it. It is now
documented in the header, `a` is refused outright (a statement whose answer flips is a new statement and
belongs in `add`, where the duplicate check can see it), and the duplicate test is re-asked over the
FINISHED pool rather than over the snapshot the per-entry checks read.

**A CITATION ALREADY ON A CARD IS NOT AUTOMATICALLY ONE A READER CAN OPEN.** `wh-373` cites the Roman
Law Library at `droitromain.univ-grenoble-alpes.fr` for the Edict of Thessalonica, and that host answers
**403 from here** to curl and to a browser user-agent alike — an Apache 403 from the origin, not the
proxy, whose relay log names only `gizamedia`. The pass's bar is a source a reader can OPEN, so the 380
edict is cited here to two witnesses that do answer: Latin Wikisource, which carries the text with its
own heading naming Gratian, Valentinian and Theodosius and its consular date, and Fordham's Internet
Medieval Sourcebook for the English. **The shipped card was left alone**: a 403 at a datacentre address
is not proof the link is dead for a reader at home, and rewriting a verified citation on that evidence
would be worse than recording it.

**AND THE CHECKER REFUSED THE BATCH OVER A WORD THAT WAS RIGHT.** Rule 2 holds the prose to British
spelling by running app.js's own table in the US→GB direction, and it demanded `labourious` for
`laborious`. That is not a word in any system: British keeps the u in `labour` and drops it in
`laborious`, straight from the Latin, and the same is true of `honour` and `honorary`. Both rows carried
the offending suffix. **On the site it was inert** — the live direction is GB→US only and no author had
written the non-words — so the only place it could bite was a checker, which is where it did. Fixed in
`SPELL_PAIRS`, proved byte-for-byte inert over 175,126 renderings of the whole corpus in both directions
(8 changed, all US→GB, all a non-word becoming the right word), and pinned in `test-spelling.js`.

### T4a — seven statements, of which three were rewritten and one contradicted its own source (2026-09-17)

Two lifted out of the corpus by the T2a recipe and five researched. The batch: the 1918 armistice
(`ww2-002` and `ww2-004`), Hitler's appointment (`ww2-054`, two of its three USHMM articles), the 1919
eclipse, the Parthenon's paint, the Ephesus gladiators' diet, Marie Antoinette and the cake, and the
Wright brothers' first flight.

**THE SHARPEST FINDING IS A STATEMENT WHOSE OWN SOURCE SAYS THE OPPOSITE OF IT.** The eclipse statement
read *"Einstein's theory of general relativity was FIRST confirmed by observations of a solar eclipse in
1919"* — and Dyson, Eddington and Davidson's own paper says, in its fourth paragraph, that "As is
well-known the theory is also confirmed by the motion of the perihelion of Mercury, which exceeds the
Newtonian value by 43″ per century". The statement is now about what the expeditions MEASURED (1.98
seconds of arc at the limb from Sobral, probable error about 0.12, against Einstein's 1.75), and the
explanation carries the paper's own correction in its last sentence. **A source that carries the fact can
still refute the framing around it**, which is one step past T2a's "the card carried a weaker claim".

**THE WRIGHT STATEMENT WAS REWRITTEN BECAUSE HALF OF IT COULD NOT BE SOURCED AT ALL.** Its hook was that
the first flight covered less ground than a jumbo jet's wingspan, and the Wright half is easy — the
Smithsonian's own object record for the 1903 Flyer gives 36 m (120 ft) in twelve seconds, 255.6 m (852 ft)
in 59 seconds for the day's best, and a 12.3 m (40 ft 4 in) wingspan, all metric-first. **The 747's
wingspan defeated four routes**: Boeing's own airport-compatibility PDFs are typeset in a custom-encoded
CID font that comes out of the stream as control characters; the FAA's Aircraft Characteristics Database
page loads but renders its download link in JavaScript; ICAO is 403 from here; and the Wayback CDX API is
blocked by egress policy on `http` and reset the connection on `https`. The statement now makes the
contrast the source itself carries — twelve seconds against 59 on the same morning.

**TWO EXPLANATIONS WERE REWRITTEN BECAUSE THEY OVERSTATED A REAL STUDY.** The Parthenon one said
"ultraviolet and raking light" and "reds, blues, greens and gold"; Verri et al. used visible-induced
luminescence and XRF and name Egyptian blue and a purple colourant. The gladiator one said the diet was
"dominated by wheat, barley and beans with little meat", which reads as a fact about GLADIATORS — Lösch
et al. found that staple in everyone buried at Ephesus, gladiators and ordinary Romans alike, and put the
low nitrogen down to pulses; **what distinguished the gladiators was strontium**, which the authors read
as the plant-ash drink the ancient texts describe. **An explanation may not promote a study's control
group finding into its headline.**

**A LIFT STILL HAS TO BE READ OFF THE SENTENCE.** `ww2-054`'s markers put the appointment by Hindenburg
and the never-a-majority on source 2 and the legal-in-form steps on source 3, which is not what the order
of the list would have suggested. `scratchpad/tf/dart.js` prints a card's sentences with the marker
numbers standing on them, and it had to be rebuilt on `split-abstract.js`'s own `pieces()` — a naive
sentence split does not fire, because the footnote marker sits BETWEEN the full stop and the space.

**AND THE CHECKER GAINED THE MIRROR OF ITS UNITS RULE.** Rule 5 reported a METRIC figure the imperial pass
cannot convert and was blind to an IMPERIAL one the metric pass cannot convert — which is the worse of the
two, and for rule 2's own reason: the pool is authored metric-first, so a bare imperial figure is what
EVERY reader sees. The Wright statement was written in feet throughout and showed feet to a reader who had
asked for metres, and nothing reported it. Measured over the pool the new direction finds **three**,
falls to two once this batch lands, and was proved live by planting the pre-fix wording back and watching
it come third. Its unit list deliberately omits `foot` — "12 foot" is not a shape this pool writes and
"on foot" is.

**THREE MORE WERE LOOKED FOR AND ARE RECORDED RATHER THAN LEFT.** Claudette Colvin's arrest of 2 March
1955 is in neither of the two National Archives Rosa Parks pages, `loc.gov` and `nmaahc.si.edu` are both
**403** from here (`guides.loc.gov` answers and its Rosa Parks guide does not name her), so that
statement waits. George Washington's blood loss has no open work behind it that Europe PMC indexes — the
three papers on his death are all closed — and its "3.5 to 5 pints" is one of the two imperial-only
figures the new rule reports. Napoleon's height is the other; `napoleon.org` answers but renders its
search in JavaScript and the obvious BMJ note is 403.

### T7a — six biology and medicine statements, all researched, and one review that carried three (2026-09-17)

The corpus has nothing on any of these, so all six were researched: the ten-per-cent-of-the-brain myth,
the bacterial cell count, hair and nails after death, antibiotics against viruses, the etymology of
*vaccine*, and shaving.

**ONE OPEN REVIEW CARRIED THREE OF THEM.** Vreeman and Carroll's *Medical myths* (BMJ 2007) takes seven
popular beliefs and works through the evidence for each, and three of this pool's statements are on its
list. **That is the shape to look for in this half of the pool**: a myth-busting review in a medical
journal is cheaper than three separate searches and is one work a reader can check for three answers.
Europe PMC marks it `isOpenAccess: N` and it nevertheless **serves in full from PubMed Central**, which
is the reminder that the bar here is *openable*, measured, rather than a licence field.

**TWO EXPLANATIONS LOST A SENTENCE EACH TO THE RULE THAT A SOURCE MUST CARRY THE CLAIM.** The brain one
said the organ uses about a fifth of the body's energy at rest, "which would be an extraordinary waste if
nine-tenths of it did nothing" — a good argument that the BMJ review does not make and that nothing else
openable was found for; it is replaced by what the review does give, which is where the myth came from
(1907, self-improvement writing, and an attribution to Einstein with no recorded source). The *vaccine*
one credited Pasteur with extending the word in Jenner's honour, which neither source carries.

**AN ETYMOLOGY IS TWO SOURCES, NOT ONE, AND BOTH ARE PRIMARY.** Jenner's own 1798 *Inquiry* supplies
*variolae vaccinae* in its title (archive.org, and its OCR passes the grep-for-a-word-the-book-must-contain
test), and Lewis and Short's *A Latin Dictionary* at Perseus supplies *vaccinus*, "of or from cows", from
*vacca*. **Perseus answers at `/hopper/text` and not at every entry**: the `vacca` entry returned 503 on
the same run that served `vaccinus` 200, which is the split CLAUDE.md records of that host.

**AND THE NEW UNITS RULE CAUGHT THIS BATCH'S OWN PROSE ON THE FIRST RUN.** The bacteria explanation quoted
the paper's "70 kg reference man" with no bracket, so a reader who asks for pounds would have been shown
kilograms; rewritten to "70-kilogram (150-pound)", and "0.2 kilograms (7 ounces)" with it. **A rule
written in the morning finding a fault made in the afternoon is the argument for writing it.**

### T9a — four astronomy, earth-science and physics statements off NASA, NOAA and NIST (2026-09-17)

Lightning's temperature, the eight minutes of sunlight, the moon's recession and the Apollo 15
hammer-and-feather drop. **THE GOVERNMENT FACT SHEET IS THIS HALF OF THE POOL'S EQUIVALENT OF THE MEDICAL
REVIEW** in T7a — one openable page, stable for decades, carrying the figure rather than an argument
about it. NSSDC's planetary fact sheets answered every time; so did the National Weather Service and the
NIST constants pages.

**NASA'S OWN SITE IS THE ONE THAT DID NOT.** `science.nasa.gov` and `www.nasa.gov` render their content
in JavaScript and hand back 200 with nothing in it, or a 404 on a path that a search says exists — the
Apollo 15 flight-journal page came back 299 KB with the word "hammer" nowhere in it. The pages that WORK
are the old plain-HTML ones under `nssdc.gsfc.nasa.gov`, and the hammer-and-feather demonstration is on
one of them, quoting the *Apollo 15 Preliminary Science Report* in full. **Reach for the fact sheet, not
the feature article.** One statement was dropped for this: the ISS-has-no-gravity myth, for which every
NASA microgravity page found either 404s or renders in script.

**TWO FIGURES IN A CITED SOURCE ARE NOT A CITED FIGURE**, and the sunlight statement is the shape to
watch. No openable page states "eight minutes"; what NASA states is the distance and what NIST states is
the speed, and the answer is the division. That is honest — both inputs are cited and a reader can do the
sum — and the explanation says so in as many words rather than presenting 499 seconds as something
looked up. It gives the range too, because the orbit is eccentric enough to move the answer by sixteen
seconds over the year.

**AND THE NEW UNITS RULE CAUGHT THIS BATCH AS WELL.** "299,792,458 metres a second" is a metric figure
the imperial pass cannot convert, and the honest bracket for it in feet is absurd. Rewritten to
"299,792 kilometres (186,282 miles) a second, a speed fixed by definition rather than measured" — which
says the same thing, converts, and is a better sentence. **Two batches, two catches: the rule is earning
its place.**

**AND A SOURCE WRITTEN IMPERIAL-FIRST HAS TO BE TURNED ROUND.** The National Weather Service gives
lightning as "50,000 degrees Fahrenheit"; Folio writes "about 27,800 °C (50,000 °F)", rounded to the
source's own two significant figures. The comparison the statement turns on is the NWS's own ("about 5
times hotter than the surface of the sun"), and NASA's photosphere figure of 5,772 K is cited beside it
so a reader can check the multiplication.

### T3a — three Chinese-history statements, and two more the corpus would not bear out (2026-09-17)

The mercury round Qin Shi Huang's tomb (`cnh-208`, two sources), the magnetic compass (`wh-531`, two)
and the imperial examination (`wh-525`, plus one page range of its own Martin). All three had to be
re-worded, which by now is the pass's commonest outcome on a statement written before the apparatus
existed.

- **The mercury** said "soil tests"; the work `cnh-208` cites measures mercury in the AIR above the
  mound by laser radar, so the statement now says what was measured. **A citation that is right about
  the fact and wrong about the method is still a citation that does not bear the claim out.**
- **The compass** had it used "for feng shui and divination for centuries" before anyone took it to
  sea. `wh-531` shows **thirty years** between the first datable description (Shen Kuo, c. 1088) and
  the first record at sea (Zhu Yu, 1119), and says nothing about divination at all. The statement now
  asks the better question the card actually answers: the earliest datable account is a bench note, not
  a sailing direction.
- **The examination** claimed "roughly a thousand years before any comparable system in Europe", a
  figure no source here gives. **What Martin gives is the comparison itself**, on the pages just before
  the ones `wh-525` already cites — writing in 1901 he had to argue it the other way about, England,
  France and Prussia having each begun using competitive examinations "of recent date and of limited
  application". A second page range of a book the corpus already opened is the cheapest new citation
  there is, and it is still a NEW one: read the pages before citing them.

**THREE MORE WERE LOOKED FOR IN THE CORPUS AND ARE NOT THERE**, which is worth recording so the next
batch does not look again. `wh-406` Terracotta Army says nothing about the farmers and the well of
1974, so that statement stands where the plan's open questions left it; `wh-565` has Zheng He at
Malacca in 1409 and nothing about the size of his fleet; and no card in the corpus has Wu Zetian,
foot-binding, chop suey or the fortune cookie as its subject.

### T10a — four psychology statements, all researched from open journals (2026-09-17)

**Nothing could be lifted out of the corpus.** The Psychology collection's fifty shipped cards run
`ps-001` to `ps-050` — psychology's own foundations, ending at Titchener and imageless thought — so not
one of the thirteen uncited Psychology statements has a card behind it. Milgram, Loftus, Zimbardo, the
Mozart effect, the testing effect and the spacing effect are all hundreds of cards further down the
running order. This batch is therefore research from scratch, and the route that worked is Europe PMC's
own open-access filter (`… AND OPEN_ACCESS:Y`) followed by the full text, since what is wanted here is a
work whose OWN abstract carries the claim.

- **Left-brain / right-brain types.** Nielsen et al. 2013 in *PLOS ONE*, read in full. The statement's
  `why` claimed the study "found no individuals with a left- or right-dominant network", which is one
  step past what the paper says; it says the data "are not consistent with a whole-brain phenotype", and
  the rewrite says that. The figures — 1,011 people aged 7 to 29, lateralisation measured between 7,266
  regions — come off the abstract, and the left-lateralised hubs really do include Broca's and
  Wernicke's areas, which is the first clause's own source.
- **The Mozart effect.** Oberleiter and Pietschnig 2023 in *Scientific Reports*. The meta-analysis itself
  is about EPILEPSY, not spatial reasoning, so it is cited for what its introduction states in its own
  voice: that the topic was introduced in the context of spatial task performance and was "ultimately
  demonstrated to be a consequence of low study power and bias-related measurement artifacts", and that
  the claims about children's intelligence came afterwards and are what popularised it. The `why`'s
  original detail — college students, one task, a gain fading in about fifteen minutes — is Rauscher,
  Shaw and Ky 1993, which is a one-page *Nature* letter and is not open; rather than cite a paper for a
  design it does not describe, the sentence was rewritten to what this one carries.
- **Learning styles.** Two sources, because the statement makes two claims. Newton and Miah 2017 in
  *Frontiers in Psychology* for the belief (58 per cent of 114 UK academics surveyed), and Aslaksen and
  Lorås 2018, a mini-review in the same journal, for the evidence — and that one is the right source
  because it is restricted to studies that actually test the meshing hypothesis: screen for a preference,
  teach in matched and unmatched conditions, look for a crossover interaction. Pashler et al. 2008, the
  obvious citation, is not open.
- **Open-label placebo.** Kaptchuk et al. 2010 in *PLOS ONE*, read in full: 80 IBS patients, 43 to no
  treatment and 37 to pills openly described as inert, significantly greater improvement on the Global
  Improvement Scale at the 11-day midpoint and the 21-day endpoint. The second sentence — that what
  improved was what the patients reported rather than the disease — is the paper's own outcome list,
  every measure of which is patient-reported.

**A GIVEN NAME READ OFF EUROPE PMC IS AN INITIAL, AND EXPANDING IT FROM MEMORY IS HOW A FABRICATED
AUTHOR SHIPS.** Europe PMC gives "Aslaksen K"; the name that came to mind was Kjetil and the author is
**Karoline**. All five citations' authors and article numbers were taken from Crossref before the batch
was written, and all five URLs were curled afterwards — 200 to an open article page in every case.

### T7b — three biology and medicine statements, and three the open literature would not carry (2026-09-17)

- **Knuckle cracking.** Two sources, one per claim. Kawchuk et al. 2015 in *PLOS ONE* imaged ten finger
  joints under traction in real time and found the sound accompanies a cavity FORMING rather than a
  bubble collapsing — the statement said "a gas bubble forming", which is right about the direction and
  is now said the paper's way. deWeber, Olszewski and Ortolano 2011 in the *Journal of the American Board
  of Family Medicine* is the arthritis half: 215 people aged 50 to 89, 18.1 per cent against 21.5, no
  association at any joint. **The `why`'s second sentence was Donald Unger's sixty-year one-hand
  experiment, and it was dropped** — the letter is closed, and its DOI carries `<` and `>`, which a
  citation in this pool cannot hold at all.
- **Vitamin C and colds.** Hemilä and Chalker's Cochrane review, read in full on PMC. Every figure in the
  rewritten `why` is the abstract's: 29 comparisons over 11,306 people, no reduction in incidence in the
  general community, colds shortened 8 per cent in adults and 14 in children, and the 598 marathon
  runners, skiers and soldiers on subarctic exercises whose risk was roughly halved. **The URL is the PMC
  copy rather than the DOI**, which resolves to a Wiley abstract; a citation's address has to be one the
  reader can actually open.
- **Chameleons.** Stuart-Fox and Moussalli 2008 in *PLOS Biology* for what the colour change is FOR —
  southern African dwarf chameleons, the most dramatic changers being those whose displays contrast most
  with the background, and "no evidence for the crypsis hypothesis" — and Teyssier et al. 2015 in *Nature
  Communications* for the mechanism and for the thermal clause the statement already carried, that being
  the deeper iridophore layer reflecting in the near infrared.

**Three were looked for and left uncited**, which is worth recording so the next batch does not repeat
the search. **Sugar and hyperactivity**: the two works the claim rests on — Wolraich's 1995 *JAMA*
meta-analysis and Hoover and Milich's parent-expectancy study — are both closed, and an open-access sweep
returns ADHD epidemiology rather than the challenge trials. **Body heat through the head**: Vreeman and
Carroll's *BMJ* festive-myths paper is closed. **The appendix**: Kooij et al. 2016 in *Clinical and
Experimental Immunology* is the right review and is not open.

**CROSSREF IS A RECORD AND THE ARTICLE'S OWN BYLINE IS THE AUTHORITY**, twice in this batch. Crossref
gives the JABFM authors as "K. deWeber", where the article's own page prints Kevin deWeber, Mariusz
Olszewski and Rebecca Ortolano; and it files the Cochrane review as 2013 issue 5, where the review's own
citation line on PMC reads `2013;2013(1):CD000980`. Both were taken from the article.

### T8a — three physics and mathematics statements off NIST, the weather service and Perseus (2026-09-17)

- **Lightning striking twice.** The National Weather Service's own *Lightning Myths* page, which lists
  this myth and answers it with a figure: the Empire State Building "is hit an average of 23 times a
  year". The statement said "roughly twenty to twenty-five", which is right and vague; it now says 23,
  which is the source's.
- **Absolute zero.** NIST's *Kelvin: Introduction*, which states `0 K = -273.15 degrees C = -459.67
  degrees F`. Two things changed with the citation. The figure is now written `−273.15 °C (−459.67 °F)`
  so the units engine converts it for a reader on imperial — with a U+2212 minus on both sides, which is
  what `U_SIGN` reads and a hyphen is not. And **the second sentence's "within a few billionths of a
  degree" was taken out**: it carries no marker, nothing in the batch establishes it, and statement #166
  in the same pool says "a few hundred trillionths", so the pool was quoting itself two ways. It now says
  "extraordinarily close" and #166 keeps its own figure until that statement is cited.
- **The infinitude of primes.** Euclid, *Elements* 9.20 in Heath's translation, on Perseus, whose text
  endpoint is one of the hosts `check-reach.js` reports answering. The proposition is quoted in the
  `why` in the form the translation gives it — prime numbers are more than any assigned multitude of
  prime numbers — and the construction with it. Cited ancient-author-first with the translator after,
  which is the house rule.

**FOUR SOURCES WERE TRIED AND ARE NOT USABLE FROM HERE RIGHT NOW, and two of the four are a fact about
the environment rather than about the work.** NOAA's National Ocean Service (`oceanservice.noaa.gov`) is
serving CHROME ONLY — its `facts/sound.html` comes back 200 with 4.2 KB of navigation and no article, and
the page carries a "Parts of the U.S. Government are closed" banner — so the speed-of-sound statement has
no source yet; and **a missing page there answers 200 with a document reading "Page Not Found: Error
404"**, which is one more variety for the list this plan's sibling keeps, and which a status check alone
cannot see. `dosits.org` is 403 and JPL's pi article is 403.

**AND AN ARXIV IDENTIFIER COMPOSED FROM MEMORY RETURNS A REAL PAPER ABOUT SOMETHING ELSE.** Reaching for
the record-cold experiment behind statement #166, `arxiv.org/abs/2007.04146` was tried from memory and is
a machine-learning paper on few-shot one-class classification. It is the DOI-from-the-shape-of-an-
identifier fault in another namespace, and it is worse here because the page resolves: nothing about the
fetch says the citation would have been wrong.

### T9b — three astronomy statements off NASA's own planet pages (2026-09-17)

The cheapest batch in the pass so far, and worth recording as a recipe: NASA's `science.nasa.gov`
per-object pages state the facts these statements are about in their own prose, carry a "Last Updated"
date to cite them by, and answer from this sandbox.

- **A day on Venus outlasting its year.** *Venus: Facts* — "your 'day' would be 243 Earth days long —
  longer even than a Venus year (one trip around the Sun), which takes only 225 Earth days" — which also
  carries the second sentence's backwards spin and the Sun rising in the west.
- **The Moon's near side.** *Moon Phases* — "tidally locked with Earth, which means that it spins on its
  axis exactly once each time it orbits our planet … We call this motion synchronous rotation." The
  `why`'s old second sentence about tidal friction slowing the rotation over billions of years was
  replaced with the point the question actually turns on, which this page does carry: it is a match
  between two motions rather than an absence of one.
- **Jupiter's mass.** *Jupiter Facts* — "more than twice the combined material of the other bodies in
  the solar system", and 11 times wider than Earth. **THE `why`'s FIGURES WERE NARROWED TO THE PAGE'S**:
  it said "about 318 times the mass of the Earth, and roughly two and a half times the mass of the other
  seven planets combined", and NASA's page states neither figure. Both are true and neither was in the
  source, which is exactly the shape a citation is supposed to stop.

**A PAGE THAT 404s HERE DOES SO HONESTLY, unlike NOAA's**: `nasa.gov/reference/what-is-microgravity/` is
a real 404 with a 404 status, so the astronaut-weightlessness statement simply has no source yet rather
than a wrong one. The asteroid-belt statement was also left alone: NASA's *Asteroids* page describes the
belt but does not carry the claim that every probe crossed it without dodging.

### T8c — three mathematics statements out of one archive (2026-09-17)

**MacTutor (`mathshistory.st-andrews.ac.uk`) IS THE HOST FOR THIS CATEGORY**: St Andrews' History of
Mathematics Archive, signed by O'Connor and Robertson, open, and it carries the history a mathematics
statement is usually about rather than the mathematics itself. Three statements came out of two of its
pages, and **one page did two of them** — Lindemann's biography carries both Lambert's 1761 irrationality
proof and the 1882 transcendence proof, which are the two halves of two different statements.

- **π calculated in full.** Lambert 1761 (irrational, so the expansion neither ends nor repeats) and
  Lindemann 1882 (transcendental). **The `why` lost its second sentence** — trillions of digits computed,
  and a few dozen enough to place a circle the size of the observable universe to within an atom's width.
  That is JPL's own illustration and **`jpl.nasa.gov` is 403 from here**, so it could not be cited.
- **Squaring the circle.** The same page states the problem in the Greek terms, says why irrationality was
  not enough — "certain algebraic numbers can be constructed with ruler and compass" — and then that
  transcendence "finally established that squaring the circle with ruler and compasses is insoluble".
- **Fermat's Last Theorem.** The Fermat biography gives the marginal note in Bachet's Diophantus and, more
  usefully for this statement, the date the note BECAME KNOWN: 1670, when his son Samuel published the
  edition carrying it. **That is what was cited rather than the usual "around 1637"**, which neither page
  states — and it makes the three centuries checkable from the sources rather than from the reader's
  arithmetic. The topic page carries the rest: June 1993, the withdrawal, Taylor through 1994.

### T10b — two statements Folio's own learning-science doc already had a source for (2026-09-17)

**THE LIFT THIS PLAN OPENS WITH WORKS OUT OF `docs/` AS WELL AS OUT OF THE CARDS, and nobody had looked.**
Two of the Psychology statements — testing beating rereading, and spacing beating cramming — are the two
findings Folio's whole scheduler is built on, and `docs/learning-science.md` has carried their sources since
that batch shipped. Dunlosky's own summary of the ten-strategy review, *Strengthening the Student Toolbox*
in *American Educator*, is **open on `aft.org` and answers from here**, where the underlying Psychological
Science in the Public Interest article is behind a DOI.

- **Testing beats rereading.** "In 1909, a doctoral student at the University of Illinois demonstrated that
  practice tests improve student performance, and more than 100 years of research has revealed that taking
  practice tests (versus merely rereading the material to be learned) can substantially boost student
  learning." The article also rates practice testing and distributed practice the two most effective of the
  ten, and rereading among the least while being what 84 per cent of students do.
  **The `why`'s 2006 study went** — Roediger and Karpicke's read-four-times experiment is the standard
  citation and is not in this article; the 1909 demonstration that is replaced it.
- **Spacing beats cramming.** "Students will retain knowledge and skills for a longer period of time when
  they distribute their practice than when they mass it, even if they use the same amount of time massing
  and distributing their practice", with the misconception named directly after it.
  **The `why` lost Ebbinghaus**, who is not in the article either; the same-total-time clause that replaced
  him is what the statement actually turns on.

### T9d — two Earth-science statements out of one USGS book (2026-09-17)

**`www.usgs.gov` IS 403 HERE AND `pubs.usgs.gov` IS NOT**, which is the finding to carry forward: the
FAQ pages a search surfaces first cannot be opened, and the USGS's own published books can. *This Dynamic
Earth: The Story of Plate Tectonics* (Kious and Tilling, 1996) is there in full as HTML, and two of its
chapters settled both of these between them.

- **Wegener.** *Historical Perspective* carries the whole refutation: in 1912 the scientific community
  "firmly believed the continents and oceans to be permanent features on the Earth's surface", his proposal
  "was not well received", its "fatal weakness" was that it could name no force, Harold Jeffreys "argued
  correctly that it was physically impossible for a large mass of solid rock to plow through the ocean floor
  without breaking up", and Wegener froze to death on the Greenland ice cap in 1930 with the controversy
  unresolved. *Developing the Theory* supplies the other end — seafloor spreading theorised in 1961 and the
  magnetic striping beside it. **The `why`'s "rejected for half a century" and "acceptance came in the
  1960s" were replaced by the dates the book states**, which say the same thing and are on the page.
- **Magnetic reversals.** The same chapter: magnetite grains locking the field direction in as lava cools,
  Brunhes in 1906 and Matuyama in the 1920s finding rocks in two polarity groups, the symmetrical striping
  either side of a ridge, and the crust as "a natural tape recording of the history of the reversals".
  **The `why` lost the 780,000-year date** of the last full reversal: it is on none of these pages, and the
  corpus's own 780,000 (in `wh-032`) is the Atapuerca dating rather than the Brunhes-Matuyama boundary, so
  it could not be lifted either.

### T5b/T7d — a national museum and a park service, and the pool passes half cited (2026-09-17)

Two statements from two different categories, put in one batch because they are the same recipe: **a
public institution that has written the myth down in order to answer it.** A museum or a park service
myth-busting page is a better source for a False statement than a research paper is, because the paper
establishes the fact while the page addresses the belief — which is what the statement is about.

- **Horned helmets.** The National Museum of Denmark's *Viking helmets*: "there is only one preserved
  helmet from the Viking Age and this does not have horns", from the warrior's burial at Gjermundbu north
  of Oslo; "none of the contemporary sources mention Vikings wearing horned headgear"; horns "would get in
  the way" in battle and aboard a warship; and where the art does show them — the Golden Horns, the Oseberg
  tapestry — "the horned figures … are berserkers", read as display or cult.
  **THE `why` LOST WAGNER.** It attributed the image to 19th-century Romanticism and the costumes for the
  1876 *Ring* cycle, which is the usual account and is not on the museum's page. The museum's own
  explanation of the horned art replaced it, and is better evidence besides.
- **Bats.** The NPS's *Myth Busters — Bats* answers it as a myth outright: bats "can see just fine and
  actually have pretty good eyesight", some larger fruit-eating bats "can see 3 times better than humans",
  and echolocation is for obstacles and prey "in low light conditions, like dawn and dusk". **The `why`'s
  "roughly 1,400 bat species" went**, that figure being on no page read here. **USGS is 403 from this
  sandbox**, so its own *Are bats blind?* FAQ — which the search surfaced first — could not be used.

**With these two the pool passes half: 109 of 220 carry a source.**

### T7c — two biology statements off NIH and the Forest Service (2026-09-17)

- **The tongue map.** The NIDCD's *Taste Disorders* names the myth in its own words — "A common
  misconception is that taste cells that respond to different tastes are found in separate regions of the
  tongue. In humans, the different types of taste cells are scattered throughout the tongue" — and carries
  the five basic qualities and the taste buds on the palate and throat.
  **THE `why` LOST ITS HISTORY AND THAT IS THE COST OF THE BATCH.** Its second sentence traced the map to a
  mistranslated German paper of 1901 redrawn by an American textbook, which is the more interesting half and
  is on none of the pages that open from here — the reviews that carry it are paywalled and Europe PMC was
  503 all afternoon. What replaced it is the same page's own account of how taste actually works.
- **The blue whale.** The Forest Service's *Pando* page states it outright: Pando "is believed to be the
  largest organism ever found at nearly 13 million pounds", 40,000-odd trees on one root system over 106
  acres, started at the end of the last ice age. **The `why`'s honey fungus went**: the Oregon *Armillaria*
  is the largest by AREA and the claim about its mass is not on any page opened here, where Pando's is — so
  the statement is refuted by one sourced organism rather than two half-sourced ones. The figures were
  written metric-first (5,900 tonnes, 43 hectares) and **both directions of the units pass were run over the
  new sentence** rather than assumed, since tonnes and hectares are the first of their kind in this pool.

### T4b — two American myths off the two federal hosts that answer (2026-09-17)

**THE HOST SURVEY IS THE REUSABLE HALF OF THIS BATCH, because most of the obvious ones are shut.** Measured
on 2026-09-17, for a category whose statements are nearly all American: `nps.gov` and
`prologue.blogs.archives.gov` answer 200 and serve their prose; **`si.edu` and its subdomains are 403 behind
Cloudflare**, so the National Postal Museum's own *Legend of Betsy Ross* page — the best single source there
is for that statement — cannot be opened from here; **`loc.gov` is 403**; and **`americanhistory.si.edu` is
403** with them. `awm.gov.au` answers, but **Trove serves an Anubis proof-of-work challenge** at
`trove.nla.gov.au/newspaper/article/<id>` — a 200-status wall of a seventh kind, and one this pass will not
solve — so the 1932 Emu War statement has no source: the contemporary Perth and Sydney newspaper reports
that carry it are all behind it.

- **Betsy Ross.** The National Archives' own blog says it flatly: her involvement in designing and making
  the first flag is "largely fictitious", the story was "likely" developed in the 1870s by her grandson
  William J. Canby, and her real connection was as a Philadelphia flag maker. The same post credits the
  design to Francis Hopkinson, which the `why` already named — so both of its claims are on one page.
- **Rosa Parks.** The NPS's *Montgomery Bus Boycott* gives Claudette Colvin's arrest on 2 March 1955, nine
  months before Parks, and names the four *Browder v. Gayle* plaintiffs. **The `why` lost its second
  sentence**, which said civil rights leaders chose Parks as the public face because she was older and
  employed; that is the standard account and the page does not carry it, and what replaced it — the case
  Colvin actually was part of — is on the page and says more.

### T6a — the first two of the hardest category, off a primary text and a government page (2026-09-17)

T6 was set down as "the hardest" and it is, because its statements are about who invented what, which is
exactly the claim a tertiary source states loosest. Two of the fifteen came out cleanly all the same, by
opposite routes.

- **Darwin and "survival of the fittest".** **THE PRIMARY TEXT IS THE SOURCE HERE, AND IT SETTLES THE
  QUESTION IN THE AUTHOR'S OWN WORDS**: the sixth edition carries "the expression often used by Mr. Herbert
  Spencer, of the Survival of the Fittest, is more accurate, and is sometimes equally convenient" — Darwin
  attributing the phrase in the very book he is supposed to have coined it in. The first edition is cited
  beside it for an ABSENCE, the phrase occurring nowhere in it, and **Project Gutenberg's own front matter
  is what makes both editions citable**: eBook 1228 is labelled "1859, First Edition" and 2009 "1872, Sixth
  Edition, considered the definitive edition", so the edition is stated by the source rather than assumed.
  **The `why` lost two facts it could not open.** It said the phrase was coined by Spencer "in his 1864
  *Principles of Biology*" and that Darwin adopted it "from the 5th edition (1869) onward"; both are true,
  neither is in either text read here, and the fifth edition was not opened. What replaced them is
  sharper anyway — the author's own attribution.
- **Edison and the light bulb.** The U.S. Department of Energy's *The History of the Light Bulb* opens on
  the point: "Like all great inventions, the light bulb can't be credited to one inventor." It dates the
  first constant electric light to 1835, gives the forty years of incandescent-lamp work after it, Edison's
  1879 and 1880 patents, Joseph Swan's English patent and the Sawyer-Man United States patent.
  **The `why`'s list of predecessors went**: it named Humphry Davy and Warren de la Rue, and the page names
  neither.

**TWO HOSTS WERE MEASURED AND BOTH FAIL, which is why the rest of this category is still open.**
`royalsocietypublishing.org` answers 403 here, so the *Philosophical Transactions* — which is where
Leeuwenhoek's own letters are — cannot be reached. And **the Einstein Papers have gone behind a launch
page**: `einsteinpapers.press.princeton.edu/vol1-doc/<n>` returns 200 carrying an announcement that the
portal "launches" into a database for "institutional partners, libraries, scholars", with no document. That
is the 200-status non-document this plan records five varieties of, in a sixth shape, so the Einstein
schoolboy-maths statement has no source rather than a wrong one. Europe PMC was 503 throughout the batch.

### T8b — three chemistry statements off two open periodic tables (2026-09-17)

**TWO HOSTS CARRY MOST OF WHAT THIS CATEGORY NEEDS AND BOTH ANSWER FROM HERE**, which is worth recording
as a recipe beside T9b's NASA one: the Royal Society of Chemistry's Periodic Table
(`periodic-table.rsc.org/element/<Z>/<name>`) and the Los Alamos National Laboratory's
(`periodic.lanl.gov/<Z>.shtml`). They are complementary rather than redundant — the RSC page carries a
narrative history and an allotrope list, Los Alamos opens its History section on the element's Latin name —
and between them they settled all three of these.

- **Diamond and graphite.** *Carbon* — the allotrope list, the glossary's own definition ("Some elements
  exist in several different structural forms, called allotropes. Each allotrope has different physical
  properties"), "Diamond is a colourless, transparent, crystalline solid and the hardest known material.
  Graphite is black and shiny but soft", and the two densities, 3.513 against 2.2. **The `why`'s bonding
  description went**: four neighbours in a rigid lattice against sliding sheets is correct and is not on
  the page, so it was replaced by what is.
- **Helium found on the Sun first.** *Helium* — Janssen's yellow line at the 1868 eclipse, Lockyer naming it
  from *helios*, and 1895 for the terrestrial find. **The `why` said Ramsay "extracted it from a uranium
  mineral"**; the page names uraninite in Hillebrand's 1889 work and does not say what Ramsay's own source
  was, so the clause went and the independent Uppsala discovery, which the page does carry, took its place.
- **Fe, Pb and Au from Latin.** Los Alamos's *Iron* opens "Latin *ferrum*"; the RSC's *Gold* says "the symbol
  comes from the Latin 'aurum'"; the RSC's *Lead* carries *plumbum* in the Chemistry in its Element
  transcript it hosts, which is where on that page the claim sits.
  **AND THE SECOND SENTENCE LOST ITS FIRST EXAMPLE.** It read "Na for natrium, K for kalium, Ag for argentum
  and Sn for stannum", and **Los Alamos's *Sodium* does not say natrium** — it gives "From the English word,
  soda; Medieval Latin, sodanum: a headache remedy". Silver and tin are both stated outright there, so the
  list was cut to the two that could be opened. A four-item list where two items are sourced is a citation
  covering half a sentence.

### T9c — the microgravity page found under another path, and two more off NASA (2026-09-17)

**T9b RECORDED THE ASTRONAUT STATEMENT AS HAVING NO SOURCE BECAUSE `nasa.gov/reference/what-is-microgravity/`
IS A REAL 404. IT IS A REAL 404 AT A URL NOBODY PUBLISHED.** The page is alive at
`nasa.gov/general/what-is-microgravity/` and states the refutation outright — "Many people mistakenly think
that gravity does not exist in space … Earth's gravitational field at about 250 miles above the surface is
88.8 percent of its strength at the surface. Therefore, orbiting spacecraft, like the space shuttle or space
station, are kept in orbit around Earth by gravity." **A composed URL that 404s says nothing about whether
the work exists**, which is the same fault as a composed DOI one step milder: the address was guessed from the
shape of NASA's other paths, the 404 was honest, and the conclusion drawn from it was not. The `why`'s "about
90 per cent" was narrowed to the page's own 88.8 per cent, and the altitude written metric-first.

- **Mercury not the hottest.** *Venus Facts* gives 872 °F (467 °C) and names the runaway greenhouse effect;
  *Mercury Facts* gives the 430 °C day and the −180 °C night and says in terms that "Mercury is not the
  hottest planet in our solar system – that title belongs to nearby Venus". **The `why`'s figures were moved
  onto NASA's**: it said 465 °C against the page's 467, which is the T9b lesson again at one degree.
  The temperatures were also rewritten from "degrees Celsius (869 Fahrenheit)" into `467 °C (872 °F)`, the
  house form, which is the only shape the units pass can convert.
- **Saturn not alone in having rings.** Three pages rather than one, because the claim is about three planets:
  *Jupiter Facts* ("Discovered in 1979 by NASA's Voyager 1 spacecraft, Jupiter's rings were a surprise …
  difficult to see except when backlit by the Sun"), *Uranus Facts* ("Uranus has two sets of rings") and
  *Neptune Facts* ("at least five main rings"). **The `why`'s "discovered between 1977 and 1989" went**: only
  Jupiter's date is on a page read for this batch, and a range is a claim about all three.

**THE ASTEROID-BELT STATEMENT IS STILL UNCITED, AND ITS `Asteroids: Facts` PAGE WAS RE-READ RATHER THAN
ASSUMED.** It carries the belt's population (1.1 to 1.9 million bodies over 1 km) and the total mass, and
says nothing about the spacing a probe meets. The arithmetic is elementary and the statement is true; what is
missing is a work that states it, and composing one out of two figures on a NASA page would be the pass
writing the source rather than finding it.

### T2c — two lifted out of the corpus, and one the corpus carries behind a paywall (2026-09-17)

Two clean lifts, which is the recipe this plan opens with and the cheapest citation there is: the card's
source was opened and read when the card was written, and the marker says which sentence it belongs to.

- **Universities founded in the Middle Ages.** `wh-511` *medieval university*, sentence 3, source 1 —
  Rashdall on archive.org. **THE STATEMENT'S OWN FOUNDATION DATES WERE DROPPED**: it gave Bologna
  c. 1088, Oxford c. 1096 and Paris c. 1150, and `wh-511` carries none of the three. What the card does
  carry is better for a True-or-False answer anyway — that in the second half of the 12th century Paris,
  Bologna, Salerno and Oxford were nearly the whole list of places answering to *studium generale*, and
  that what made the title worth having was the *jus ubique docendi*.
- **The Colosseum flooded for a sea-fight.** `wh-362` *Colosseum*, sentence 4, which carries two markers
  of its own: Cassius Dio 66.25 for the flooding, the cranes and the four elephants, and Suetonius
  *Divus Titus* 7 for the five thousand beasts. Both lift across with their sentence. The statement's
  second sentence — that flooding was possible only before the hypogeum was dug — is not in the card and
  was dropped rather than carried on a citation that does not make it.

**AND ONE WAS REFUSED ON THE BAR, WHICH IS WORTH RECORDING BECAUSE THE CLAIM IS TRUE AND THE CARD MAKES
IT.** Statement #63, the Mongol Empire as the largest contiguous land empire, is `wh-594`'s own first
sentence — and the source that sentence points at is David Morgan's chapter in *Beyond the Legacy of
Genghis Khan*, which this corpus labels **[Paywalled]**. The bar here is one OPENABLE source, so the
lift cannot be made; the statement needs an open work for that claim, or nothing. Its `why` also states
"roughly 24 million square kilometres" with no imperial bracket beside it, which rule 5 would report the
moment the statement is touched, so a future batch has two things to fix rather than one.

### T11 — four out of two NASA pages and one NOAA fact page (2026-09-17)

Four astronomy and earth-science statements, each narrowed to what its own page carries.

- **Halley's Comet.** NASA's 1P/Halley page gives Halley's 1705 recognition that the comets of 1531,
  1607 and 1682 were one object returning, his correct prediction of 1758, the Bayeux Tapestry and
  "observations dating back more than 2,000 years". **THE 240 BCE CHINESE RECORD WAS DROPPED**, along
  with the "European and Islamic records": the page states the span in round terms and names none of
  the three traditions, and keeping a date the source does not give would be citing a work for a figure
  it never prints.
- **Earth's closest approach.** NASA Earth Observatory's Milankovitch article gives perihelion "on or
  about January 3", aphelion "on or about July 4" and the 3 per cent difference outright, and its
  obliquity section gives the 23.5-degree tilt and its control of seasonal contrast. The statement's
  old wording asserted the seasons are caused by tilt *rather than* distance — a comparison the page
  does not make — so it now says the seasons follow the tilt, which the page does make.
- **The tallest mountain, and the summit furthest from the centre.** One NOAA National Ocean Service
  fact page answers both, so both statements cite it. **ITS FIGURES REPLACED OURS RATHER THAN SITTING
  BESIDE THEM**: NOAA gives Everest as 8,848 m (29,029 ft) where the statements had the 2020 revision's
  8,849 m, Mauna Kea as "more than 10,210 metres from base to peak" where the statement had "about
  10,200", and Chimborazo as a 6,268 m summit standing "over 2,072 meters" further out where the
  statement had 6,263 m and "about 2 kilometres". A citation is a claim about what the work says, so
  where the two disagree the prose moves, not the note. **AND MAUNA KEA'S "only the top 4,200 above
  water" WENT WITH THEM** — a true figure the page does not carry.

### T12 — four mathematics statements off MacTutor and one chemistry statement off the RSC (2026-09-17)

Five, and four of them corrected a date or a figure the statement had asserted without one.

- **More reals than whole numbers.** MacTutor's Cantor biography puts the uncountability proof at
  December 1873, published 1874, beside the countability of the rationals and the algebraic numbers.
  **THE DIAGONAL ARGUMENT WAS DROPPED**: the statement credited the 1874 paper with it, and the page
  says the idea of a one-one correspondence is only implicit in that work — the diagonal proof is a
  later one, and attaching it to 1874 was a claim the source contradicts.
- **Goldbach's conjecture.** MacTutor gives the 1742 letter to Euler and "still an open question",
  and the computer check "up to at least 4 × 10^14". **THE STATEMENT HAD "about four quintillion"**,
  which is 4 × 10^18 — ten thousand times the figure the cited page carries. It now says 400 trillion.
  The looser figure may well be current; what it is not is what this source says.
- **The Möbius strip.** MacTutor gives the construction and the one-sidedness outright, and adds that
  Möbius came upon it in 1858 but that precedence belongs to Listing on either criterion — which is
  worth more to a reader than the sentence it replaced. **THE "ONE EDGE" HALF OF THE STATEMENT IS NOT
  EXPLAINED**, because the page does not carry it; the answer explains the side, and the statement
  still stands on it.
- **Zero.** MacTutor's history of zero has Brahmagupta's rules in the seventh century and Fibonacci
  describing the nine Indian symbols and the sign 0 "for Europeans in around 1200 but it was not
  widely used for a long time after that". **TWO FIGURES WENT**: the precise 628 CE, which the page
  states only as the seventh century, and "still being resisted in some Italian cities in the
  thirteenth century", which it does not state at all.
- **Mendeleev's gaps.** The RSC's gallium and germanium pages carry the whole claim between them —
  the 1869 arrangement, the prominent gaps, the eka- names, the forecast weights and densities, and
  both discoveries with their dates. The germanium page also gives the ekasilicon weight of 72
  against a real 72.6, which is a sharper illustration than "matched his predictions closely".

### T13 — three biology statements out of the open literature (2026-09-17)

Europe PMC answered again this afternoon (it had been 503 all through T7), so three statements were
researched rather than lifted. Each lost a detail the paper carrying the claim does not have.

- **The giraffe's neck.** A 2023 *Proceedings of the Royal Society B* paper on sloth cervical counts
  states the rule and both exceptions in its own abstract — seven is "highly conserved", manatees and
  the two tree-sloth genera are the only mammals that deviate — and elsewhere says outright that
  giraffes have "just seven cervical vertebrae but long, flexible necks". **THE SLOTH RANGES WERE
  ADDED** because the paper gives them: *Choloepus* down to five, *Bradypus* up to ten.
- **Tardigrades in space.** Cited to a 2026 *Molecular Ecology* review, which states the vacuum-of-space
  tolerance and the tun, and names the two low-Earth-orbit papers behind it. **THE 2007 ESA EXPERIMENT,
  THE TEN DAYS AND THE VIABLE EGGS ALL WENT.** The primary paper — Jönsson et al., *Current Biology*
  2008 — is the right source for those and **CANNOT BE CITED HERE**: cell.com answers 403 and the DOI
  resolves to a 3 KB JavaScript wall, so the bar of one openable source is not met. The review is CC BY
  and readable in full on Europe PMC.
- **The octopus.** A 2015 *Frontiers in Zoology* paper on Antarctic octopods carries the whole claim in
  one clause — "three hearts and contractile veins that pump haemolymph, which is highly enriched with
  the blue coloured oxygen transport protein haemocyanin". **THE COPPER WENT**: the paper never says
  haemocyanin is copper-based, and the contrast with iron-based haemoglobin was the statement's own.

### T14 — the five senses, and opposites attracting (2026-09-17)

- **The five senses.** A 2024 *Frontiers in Neurology* historical review states in its own abstract that
  Aristotle's list is "still in use among non-scientific lay persons", that it misses the vestibular
  system and musculotendinous proprioception, and that it confuses touch with the somatosensory system.
  **THE STATEMENT'S SEPARATE TEMPERATURE AND PAIN SYSTEMS WENT**, the review naming neither.
- **Opposites attract.** Cited to a 2025 *Psychological Science* paper, which calls assortative mating a
  ubiquitous pattern in mate choice, well documented in humans across physical, personality and
  demographic characteristics. **THE LIST OF TRAITS WAS GENERALISED**: education, political and
  religious attitudes, age and habits come from the Horwitz et al. 2023 meta-analysis, and that paper is
  **NOT CITABLE HERE** — nature.com serves its abstract and paywalls the article, its Europe PMC record
  is not open access, and the fullTextXML endpoint answers 500. **The claim about attitude similarity
  predicting attraction went with it**, being that literature's rather than this paper's.

### T15 — Ada Lovelace twice, and penicillin off the Nobel presentation speech (2026-09-17)

- **Ada Lovelace (two statements).** MacTutor's Lovelace biography says she "described how the
  Analytical Engine could be programmed and gave what many consider to be the first ever computer
  program", and the 1843 notes themselves are openly readable in *Scientific Memoirs* vol. 3 on
  archive.org (the Bombay Branch scan) — Note G ends by "following up in detail the steps through which
  the engine could compute the Numbers of Bernoulli", with a diagram and table appended. **THE CREDIT
  IS COMPLICATED BY BABBAGE'S OWN ACCOUNT, WHICH MACTUTOR QUOTES**, and the first statement now carries
  it: he had offered to work the Bernoulli problem out "to save Lady Lovelace the trouble", and she sent
  it back having detected a grave mistake in his process. That is a correction worth a reader's time and
  it is in the source, so it went in rather than being smoothed over.
  · **THE PRIMARY SOURCE IS CITED BY ITS NOTE, NOT BY A PAGE RANGE.** The running heads in the OCR give
    690, 697, 724, 725 and 730, so Note G's own span could be inferred to within a page or two and
    that is exactly the sort of figure this pass must not invent; "Note G" is a locator the reader can
    actually find. **And a primary source cannot attest to a "first"** — the attribution is MacTutor's,
    and that is why the second statement carries both works and marks them separately.
- **Penicillin.** The 1945 Nobel presentation speech carries the whole arc: the 1928 contaminated
  culture, the failure to purify a substance that "easily lost its antibacterial effect", Oxford taking
  it up, Chain and Florey deciding in 1938 to look at it, the first published results in sick patients
  in August 1941 with supplies so short that some treatments were stopped early, and Florey rousing the
  interest of the United States. **THE WARTIME AMERICAN FERMENTATION AND "many WWII casualties" WENT**:
  the speech has Florey interesting the Americans and stops there.

### T16 — two Roman statements out of Smith's dictionary on LacusCurtius (2026-09-17)

`penelope.uchicago.edu` carries the whole of Smith's *Dictionary of Greek and Roman Antiquities* (1875),
which the corpus already cites twice on `wh-362`, and two of the uncited Roman statements are answered in
it outright.

- **Vomitoria.** The *Amphitheatrum* article: "The doors which opened from the staircases and corridors
  on to the interior of the amphitheatre were designated by the very appropriate name of *vomitoria*",
  and it quotes Gibbon's sixty-four of them at the Colosseum. The statement needed no correction, only
  a source.
- **Gladiators and the loser.** The *Gladiatores* article carries the *missio* — the discharge for the
  day a spared gladiator received — and the *sine missione* show in which the conquered were never
  spared, forbidden by Augustus. **THE DEATH RATE WENT.** "Roughly 1 in 5 to 1 in 10 bouts" is a modern
  estimate this article does not make, and so did the economic argument about the cost of training a
  gladiator. What survives is stronger anyway: the Romans had a word for sparing him.

**AND ONE WAS OPENED AND REFUSED, WHICH IS THE POINT OF READING THE SOURCE.** Statement #51 says the
meaning of *pollice verso* is unknown and debated. Smith's *Gladiatores* states flatly that the people
"pressed down their thumbs if they wished him to be killed", citing Horace and Juvenal — that is, the
article takes the very position the statement calls unsupported. Citing it would have put a source under
a sentence it contradicts. The statement stays uncited until a work that argues the modern view can be
opened.

### T17 — sound in the sea, and two unit findings that could not be cleared (2026-09-17)

- **Sound in water.** NOAA's National Ocean Service fact page states that "sound moves at a much faster
  speed in the water than in air", and then explains the sound channel and the hydrophones that pick up
  whale song from many kilometres away. **THE TWO SPEEDS WENT** — 1,480 m/s in seawater against 343 m/s
  in air — because the page carries neither figure, and so did the explanation about denser, stiffer
  media. The sound channel is a better answer than the numbers were.
  · Two pages that WOULD carry the figures are shut from here: `dosits.org` (the Discovery of Sound in
    the Sea, University of Rhode Island) answers **403**, and the obvious NOAA sibling pages
    (`how-sound-travels.html`, `oceanexplorer.noaa.gov/facts/sound.html`) are 404.

**AND THE TWO STANDING UNIT FINDINGS COULD NOT BE CLEARED IN THIS BATCH, WHICH IS A FACT ABOUT THE
WRITER RATHER THAN THE PROSE.** `check-truefalse.js` has long reported #23 (Napoleon, "5 feet") and #71
(Washington, "5 pints") as imperial figures with no metric bracket. Both rewrites were drafted —
"roughly 1.68 to 1.70 metres (5 feet 6 to 7 inches)" and "an estimated 1.7 to 2.4 litres (3.5 to 5
pints)" — and **`add-truefalse.js` REFUSED THEM, because its `cite` action requires a `src`**: a
statement ships cited, and there is no way through that tool to touch a `why` without also citing it.
That is the right rule and it is not worth weakening for two brackets. What both statements need is a
source, and neither has one yet: `napoleon.org`'s height article is 404, Mount Vernon answers **403**,
and the Permanente Journal paper on Washington's death is not open at Europe PMC (its `fullTextXML`
answers 500). **Cite them and the units fix rides along.**
