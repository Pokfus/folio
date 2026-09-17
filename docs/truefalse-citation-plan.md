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
| T2 | Ancient & classical | part done; T2a, T2b and T2c between them |
| T3 | Chinese history | part done; `cnh-` cards carry most of it |
| T4 | Modern history | part done; T4a took three and T4b two, the rest blocked by shut hosts |
| T5 | Medieval & early modern | part done; T2c took one out of `wh-511` |
| T6 | Science & invention | the hardest; T6a took two of fifteen, off Gutenberg and the DOE; see the three below |
| T7 | Biology / Medicine | part done; T7a took six and T7b three, all researched |
| T8 | Physics / Chemistry / Mathematics | part done; T8a took three off NIST, the NWS and Perseus, T8b three off the RSC and Los Alamos periodic tables |
| T9 | Astronomy / Earth science | part done; T9a took four, T9b three and T9c three, all off NASA |
| T10 | Psychology | part done; T10a took four, all researched — the collection has only reached the 1800s, so nothing could be lifted |

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
