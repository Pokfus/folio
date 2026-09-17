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
| T2 | Ancient & classical | part done; T2a, T2b, T2c and T16 between them; T29 one off Pliny and Plutarch; T30 one lifted out of `wh-212` and `gr-767` |
| T3 | Chinese history | part done; `cnh-` cards carry most of it; T19 two lifted out of `wh-399`, `wh-400` and `cnh-238` |
| T4 | Modern history | part done; T4a took three and T4b two, T31 one off Norden's 1755 Egypt, the rest blocked by shut hosts |
| T5 | Medieval & early modern | part done; T2c took one out of `wh-511`, T5b one off the National Museum of Denmark, T24 one off ffoulkes, T30 two lifted out of `us-041`, `wh-511` and `gw-511` |
| T6 | Science & invention | the hardest; T6a took two of fifteen, off Gutenberg and the DOE, T15 three off MacTutor, archive.org and the Nobel Foundation, T25 one more off MacTutor, T32 one more off the DOE, T33 one off a 2021 neutron-tomography paper; see the three below |
| T7 | Biology / Medicine | part done; T7a took six, T7b three, T7c two, T7d one, T13 three, T14 one, T21 two, T22 one, T23 one, T26 one, T27 one and T29 one, all researched |
| T8 | Physics / Chemistry / Mathematics | part done; T8a three off NIST, the NWS and Perseus, T8b three off the RSC and Los Alamos periodic tables, T8c three off MacTutor, T12 four more off MacTutor and one off the RSC, T17 one off NOAA, T18 one off the RSC and one off Lavoisier, T25 three off OpenStax and one off the Nobel Foundation, T27 one more and T28 one more off OpenStax |
| T9 | Astronomy / Earth science | part done; T9a four, T9b three and T9c three off NASA, T9d two off a USGS book, T11 four off NASA and NOAA, T20 one lifted out of `wh-151`, T26 three off OpenStax and NASA Space Place, T34 one off two open diamond papers |
| T10 | Psychology | part done; T10a took four, researched; T10b two lifted out of `docs/learning-science.md`; T14 one; T27 two off OpenStax |

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

### T18 — stainless steel off the RSC, and rust off Lavoisier himself (2026-09-17)

- **Stainless steel.** The RSC's chromium page: "In corrosion-resistant, or 'stainless', steels, at
  least 11% of its mass is chromium. The alloyed chromium reacts with oxygen to form a transparent
  nanoscopic layer of oxide that forms a barrier to further oxygen penetration." **TWO DETAILS WENT** —
  "only a few atoms thick", which the page calls nanoscopic and does not measure, and the film
  re-forming wherever the surface is scratched, which it does not mention at all. The threshold is
  now the page's own 11 per cent rather than "above roughly a tenth".
- **Rust weighs more.** Cited to **Lavoisier's own book**, Kerr's 1790 translation on Project Gutenberg:
  he burns iron in a closed vessel, finds the metal has gained exactly what the air has lost, and
  elsewhere renames "rust of iron" the red oxide of iron. **HIS FIGURES WERE DELIBERATELY LEFT OUT** —
  100 grains of iron, 35 grains gained, 70 cubical inches of air lost. A grain is an imperial unit, and
  the house rule puts metric first, which here would mean restating an eighteenth-century experiment in
  units its author never used; the argument survives without them, so the sentence gives the relation
  and not the numbers. **The 1770s date went too**, the book being 1790 and the experiment undated in it.

### T19 — two Confucius statements lifted out of the corpus (2026-09-17)

Both are clean lifts, and between them they use four of Folio's own cited sentences.

- **Confucius in his own lifetime.** `wh-399` sentences 3 and 4 carry it in Hirth's and Legge's own
  words: the offices he first held in Lu asked only that he keep his accounts straight and see that the
  oxen and sheep on the public fields were fat, and he "was never chief minister of the state, though it
  has often been said he was" — which is a correction the statement did not have. For the other half,
  `cnh-238` sentence 1 gives the Han court's decision to recognise the Confucian classics as the one
  learning worth its patronage, centuries after his death. **THE WANDERING YEARS AND "died believing he
  had failed" WENT**: neither is in the corpus's cited prose, and the Han decision says the same thing
  from the other end and is sourced.
  · **THE `cnh-238` CITATION IS A CHICAGO SHORT FORM ON THE CARD** (`Liu, "On the Supremacy of
    Confucianism," 99`) — correct there, where a fuller note precedes it, and **useless standing alone in
    `truefalse.js`**, where nothing precedes it. It was resolved back to the full form through Crossref
    before being lifted. **A lift is not a copy: check whether the note you are taking depends on one
    above it.**
- **Confucius as a god.** `wh-400` sentences 1, 2 and 7 define Confucianism as a body of teaching whose
  two central words are *ren* and *li*, and put its becoming an official system under the Han; `wh-399`
  sentence 5 has him calling himself a transmitter and not a maker. **THE DEIFICATION IS NOT ADDRESSED
  DIRECTLY**, because nothing in the corpus's cited prose dates the cult; what the answer now shows is
  that the tradition is ethical and political and that it was made official long after he died.

### T20 — the green Sahara, and a sweep that says where the cheap lifts have run out (2026-09-17)

- **The green Sahara.** `wh-151` carries the whole answer in three cited sentences: the strengthened
  summer monsoon turning the world's largest hot desert into grassland, lakes and rivers; the period
  beginning about 15,000 years ago and closing by roughly 5,500, driven by precession; and Lake Megachad
  covering some 361,000 square kilometres. **THE DATES MOVED TO THE CARD'S** — the statement had
  "roughly eleven thousand to five thousand years ago" — **and "orbital tilt" went**, the card naming
  precession alone. Sediment cores, rock art, fossil pollen and cattle herders went with them, none
  being in the cited prose; Lake Megachad's hippopotamus is a better sentence than any of them.

**AND THE REST OF THE CORPUS WAS SWEPT, WHICH IS WHERE THIS PASS NOW STANDS.** Every uncited statement
was matched against every card's answer term, and the match list is short on anything liftable:

- **`wh-524` Chang'an cannot carry #47.** It says the city was "one of the largest cities in the world",
  where the statement says THE most populous, "around a million people". A source that says less than
  the statement is not a source for it, and a marker pointing at a claim the work does not make is the
  thing this whole apparatus exists to prevent. **Refused**, like `pollice verso` in T16.
- **`wh-212` and `rm-384` cannot carry #11 (Cleopatra and the Pyramid).** Both dates exist — Built
  c. 2589–2566 BCE, Died 30 BCE — but **only in the cards' DATE LINES**, which carry no footnote
  markers; there is no marked sentence to lift from. **A date line is not a citable sentence.**
- **`wh-212` cannot carry #8 either.** Its workforce sentence gives Herodotus's hundred thousand against
  a modern twenty to thirty thousand, and says nothing about pay or slavery. The page that would —
  UCL's *Digital Egypt* "The workmen at a pyramid", which the card itself cites — **now answers 403
  behind a Cloudflare interstitial** ("Just a moment… Enable JavaScript and cookies to continue"). A
  host the corpus already rests on has closed since those cards were written.
- **`wh-528` does not mention foot-binding**, and `wh-406`/`cnh-209` do not mention the 1974 well: the
  Terracotta Army cards are about the bronze weapons' chromium, not the discovery.

### T21 — Semmelweis and willow bark, researched (2026-09-17)

- **Semmelweis.** A 2025 *GMS Hygiene and Infection Control* review gives the ward figures year by
  year: 459 of 4,010 women dead in 1846 (11.4%), about 5% in 1847 after chlorine washing came in
  mid-May, and 1.3% in 1848. **THE STATEMENT'S "around 18 per cent to about 2" WENT** — the real
  numbers are better and are the paper's own. It also carries his own words, that his teachings were
  "either ignored or attacked", and that he was committed to an asylum in 1865 and died there of
  sepsis at 47. **"Dismissed from his post" went**, the paper not saying it.
- **Willow bark.** A 2023 *Life* meta-analysis opens on the history: willow bark used medicinally for
  over 3,500 years, taken by the Sumerians and ancient Egyptians as painkiller and antipyretic,
  Hippocrates giving it for inflammatory pain in the fourth century BCE, and salicin refined into
  aspirin in 1897, the name joining acetyl to *Spirsäure*. **THE MECHANISM WENT** — salicin converted
  in the body to salicylic acid is not in the paper, which says instead that salicylic acid was
  isolated from the bark by Buchner in 1827.
  · **AND A TYPO IN THE SOURCE WAS NOT COPIED.** The same paragraph reads "In 1987, the chemists of
    Bayer synthesized a steady acetylated salicylate" — plainly 1897, two sentences after it has
    already said 1897. The `why` takes the sentence that is right and leaves the one that is not.
    **A citation is a claim about what a work says, which is not the same as a warrant to repeat
    everything it says.**

### T22 — why honey keeps (2026-09-17)

A 2026 *Food Science & Nutrition* review gives the mechanism in full: the unbound water (water
activity) in honey is too low for microbes to proliferate, undiluted honey is hypertonic so water
leaves a bacterium rather than entering it, and the acidity and the hydrogen peroxide made by glucose
oxidase act alongside those. **THE EGYPTIAN TOMB JARS WENT** — a much-repeated claim that this review
does not make and that nothing openable from here establishes — and with it the statement's own
"thousands of years". The answer now explains **why** honey keeps and leaves the reader's question
answered by the mechanism rather than by an anecdote.

### T23 — the appendix, with its hedge intact (2026-09-17)

A 2026 *Frontiers in Cellular and Infection Microbiology* review states that the vermiform appendix
"was long considered a vestigial organ, yet accumulating evidence now supports its role as a component
of gut associated lymphoid tissue and as a niche involved in microbial homeostasis", and that it
"harbors a distinct microbial composition rather than being a passive extension of fecal content". It
also carries Bollinger's "safe house" concept — a protected reservoir of commensal biofilms that can
help repopulate the colon after diarrheal or infectious disruption.

**THE HEDGE TRAVELLED WITH THE CLAIM, WHICH IS THE POINT OF THIS ONE.** The paper calls the safe-house
idea a *proposal* and its plausibility *biological*, where the statement asserted it flat ("is now
thought to act as a reservoir"). Narrowing a `why` is usually about dropping a figure the source does
not carry; here what the source carries is a hypothesis, and reporting it as a fact would have been a
different kind of misquotation — the citation would have checked out and the sentence still been wrong.

**AND THREE SEARCHES CAME BACK EMPTY**, so those statements stay uncited and should not be re-searched
blind: sharks and cancer (nothing open on the cartilage myth), the optics of why veins look blue, and a
phylogenomics paper stating the fungi–animal sister relationship plainly enough to cite for it.

### T24 — the knight and the crane (2026-09-17)

Charles ffoulkes, *Armour & Weapons* (Clarendon Press, 1909), on archive.org — the Tower armouries'
own curator's circle, and it answers the statement without ever mentioning the crane: "the weight of
plate armour was less felt than that of mail, because the former was distributed over the whole body
and limbs, while the latter hung from the shoulders and waist alone", followed by Robert de Vere
swimming the river at Radcot Bridge in full armour, Oliver de la Marche's knight leaping clear out of
the saddle fully armed in 1446, and Shakespeare's Henry V on vaulting into the saddle armoured.

**THE WEIGHT FIGURE WENT AND THAT WAS THE HARD PART.** The statement gave "about 20 to 25 kilograms
(44 to 55 pounds)", which ffoulkes does not state for field armour — the weights he does give are
**jousting helms (13½ to 25 lb each) and a foot-combat suit of 235 pieces at 93 lb**, and quoting
either as the weight of a harness would be worse than quoting none. **A book full of numbers is not a
source for the number you wanted.** The crane's supposed origin in an 1843 *Punch* and in Olivier's
*Henry V* went for the plainer reason that nothing openable from here establishes it.

· **THE OBVIOUS MODERN SOURCE IS SHUT.** Askew et al., "Limitations imposed by wearing armour on
  Medieval soldiers' locomotor performance" (*Proc. R. Soc. B*, 2012) is the paper this statement
  wants; Europe PMC has the record but not the text (`fullTextXML` answers **500**), and
  `royalsocietypublishing.org` is already recorded shut. The Met's armour essay answers **429** —
  busy rather than shut, per `check-reach.js`'s own distinction — and is worth retrying when spaced.

### T25 — an open textbook is a source (2026-09-17)

**Five statements, 146 → 151 of 220 (69%).** The batch's finding is a HOST rather than a fact:
**OpenStax's textbooks answer from this sandbox and are CC BY**, which gives the physics and
chemistry categories — the two with the most uncited statements left and the fewest openable papers
behind them — a real reference shelf. Three of the five came off it. Cite it and paraphrase; do not
lift its prose, since its own notice asks that the text not be ingested wholesale.

· **#82 pure water is a poor conductor (TRUE)** — *Chemistry 2e*, 11.2 Electrolytes, which gives the
  mechanism and the figure in one sentence: a substance needs freely mobile charged species to
  conduct, and in pure water "only about two out of every 1 billion molecules ionize at 25 °C". The
  statement's old answer said pure water conducts "about a ten-millionth as well as seawater", which
  nothing openable bore out, so the ratio went and the ionisation figure took its place.

· **#83 the current is fast and the electrons are slow (TRUE)** — *University Physics Volume 2*, 9.2
  Model of Conduction in Metals, which states both halves: signals travel "on the order of 10⁸ m/s, a
  significant fraction of the speed of light" while the charges drift "on the order of 10⁻⁴ m/s",
  and says why — "drift velocity is quite small, since there are so many free charges". A
  ten-thousandth of a metre a second is a tenth of a millimetre, so the statement's "less than a
  millimetre per second" is safe.
  **THE EXPONENTS ARE SPELLED OUT IN THE ANSWER AND THAT IS DELIBERATE**: a `why` renders as HTML and
  `<sup>` is in the sanitizer's allowlist, so `10<sup>8</sup>` would draw correctly — and would sit
  three words from a footnote marker, which is the same glyph doing a different job. Words cost
  nothing here.

· **#150 water can be made to boil at room temperature (TRUE)** — *Chemistry 2e*, 10.4 Phase
  Diagrams. The liquid–vapour curve "provides the boiling point for water at any pressure", 100 °C at
  one atmosphere; and water sealed at 25 °C with the air removed settles at a vapour pressure of
  0.03 atm. The old answer said "about a fortieth of an atmosphere" at 20 °C, neither figure from
  anywhere; both now come off the same page.

· **#31 Einstein failed mathematics (FALSE)** — MacTutor's Einstein biography, which carries both
  halves of the refutation: he "studied mathematics, in particular the calculus, beginning around
  1891", at twelve, and he graduated in 1900 as a teacher of mathematics and physics. **WHAT HE DID
  FAIL IS IN THE SAME PAGE AND IS NOT THE SAME THING** — the ETH entrance examination, after which he
  went to Aarau to sit it again. The old answer had Einstein himself debunking the story by saying he
  had mastered the calculus before fifteen; that quotation is not in MacTutor and was not chased, so
  it went.

· **#165 the electron came before the nucleus (TRUE)** — two Nobel pages. Thomson's Facts page dates
  the electron: "In 1897 he showed that cathode rays … consist of particles — electrons — that
  conduct electricity." Rutherford's Biographical dates the other end: "In 1910, his investigations
  into the scattering of alpha rays and the nature of the inner structure of the atom which caused
  such scattering led to the postulation of his concept of the nucleus."
  **THE ANSWER LOST ITS "FOURTEEN YEARS LATER" AND ITS GOLD FOIL.** The Nobel page says 1910 where
  Rutherford's paper is 1911, and it does not mention alpha particles bouncing back at all — that is
  Geiger and Marsden, a separate citation this batch did not have. "More than a decade later" is true
  of either date and is what the sources carry.

**Hosts measured this batch.** Open: `openstax.org`, `mathshistory.st-andrews.ac.uk`,
`nobelprize.org`, `nist.gov`, `esa.int`, `british-history.ac.uk`, `science.nasa.gov`. Shut:
**`ox.ac.uk` (403)** and **`jpl.nasa.gov` (403)**. Useless rather than shut:
**`oldbaileyonline.org`**, which serves a 1 KB JavaScript shell, so the Chaloner trial cannot be read
out of it — which is why **#32, Newton and the counterfeiters, was NOT taken**: MacTutor's Newton
page reaches "Warden of the Royal Mint in 1696 and Master in 1699" and "particularly active in
measures to prevent counterfeiting of the coinage", and stops there. **A source that says less than
the statement is not a source for it**, and the statement says prosecuted and executed.

**The astronomy trio was researched and not taken.** NASA's own Sun and asteroid FACTS pages do not
state that the Sun is white above the atmosphere (#88), that the belt is empty enough to fly through
unaimed (#95), or where Polaris ranks in brightness (#96) — the Sun page calls it a "yellow dwarf"
and says nothing about colour as seen from space. All three want a different NASA page or a
different host; they are the obvious next astronomy batch.

### T26 — the same shelf, one chapter over (2026-09-17)

**Four statements, 151 → 155 of 220 (70%).** T25's finding applied: OpenStax has an *Astronomy 2e*
and a *Biology 2e* as well, and between them they answer three of the four statements outright, two
of them by naming the misconception in the source's own words.

· **#96 Polaris is not the brightest star (FALSE)** — *Astronomy 2e* 17.1 says it in a sentence: "It
  is a common misconception that Polaris (magnitude 2.0) is the brightest star in the sky, but … that
  distinction actually belongs to Sirius (magnitude −1.5)." The positional half comes from 2.1, which
  calls Polaris the pole star and "the star that moves the least amount as the northern sky turns each
  day". **THE OLD ANSWER'S "ranks somewhere around fiftieth" WENT** — no source reached here gives
  Polaris a rank, and two magnitudes say the thing the rank was there to say.

· **#95 the asteroid belt is not crowded (FALSE)** — *Astronomy 2e* 13.1: "the typical spacing between
  objects (down to 1 kilometer in size) is several million kilometers", "if you were in the asteroid
  belt, there would be far more empty space than asteroids", and the parenthesis about the spacecraft
  "which needed to travel through the asteroid belt without a collision". **THE PROBE LIST IS THE
  SOURCE'S, NOT OURS**: the old answer named Pioneer, Voyager, Galileo, Cassini and Juno; OpenStax
  names Galileo, Cassini, Rosetta and New Horizons, so that is the list the answer now gives.

· **#170 humans are closer to mushrooms than mushrooms are to plants (TRUE)** — *Biology 2e* 24.1,
  which states the relationship twice and gives two of the traits behind it, chitin cell walls and
  glycogen storage. **"Opisthokont" came out**: the word is not on the page, and the claim it was
  carrying is.

· **#88 the Sun is white seen from space (TRUE)** — the one that took two hosts and nearly did not
  happen. *Astronomy 2e* 5.3 gives the first half ("sunlight, which looks white to us, is actually
  made up of a mixture of all the colors of the rainbow"; "the white light from the Sun and stars")
  and nothing about the atmosphere. NASA Space Place's **"Why Is the Sky Blue?"** gives the second,
  and the passage that matters is under its own sub-heading rather than in the main text: "As the Sun
  gets lower in the sky, its light is passing through more of the atmosphere to reach you. Even more
  of the blue light is scattered, allowing the reds and yellows to pass straight through to your
  eyes." **A SUB-HEADING IS NOT ALWAYS IN THE FIRST SCREEN OF EXTRACTED TEXT** — the sentence-level
  grep that found the scattering found none of this, and it took reading the page from the heading
  onwards.

**NOT TAKEN.** #100 (a banana is a berry, a strawberry is not) is HALF sourced and left rather than
half cited: *Biology 2e* 32.2 defines accessory fruits and names the strawberry's receptacle
outright, and defines neither *berry* nor the banana. **Half a statement is not a cited statement**,
and the missing half is the one the statement leads with.

**Hosts.** `openstax.org` answers for *Astronomy 2e*, *Biology 2e*, *Chemistry 2e* and *University
Physics*, which between T25 and T26 is where seven of nine citations came from. `spaceplace.nasa.gov`
and `imagine.gsfc.nasa.gov` answer; **`scijinks.gov` does not** — the proxy returns `CONNECT tunnel
failed, 502`, which is a different failure from a 403 and worth one retry before it is written off.
**NASA's own `science.nasa.gov` facts pages remain the wrong shelf for this work**: they are written
to enumerate, and none of the three astronomy statements here could be answered from them.

### T27 — four more off the same shelf, and what each one had to give up (2026-09-17)

**Four statements, 155 → 159 of 220 (72%).** All four off OpenStax, which after three batches is now
the pool's largest single publisher. The batch's interest is not the citations but the **four
deletions they forced**, one per statement, each an unsourced clause that had been reading perfectly.

· **#132 Milgram's volunteers obeyed (TRUE)** — *Psychology 2e* 12.4 gives the whole apparatus: forty
  men, 15-volt steps to 450 volts, the shocks and the learner both staged, "65% of the participants
  continued the shock to the maximum voltage and to the point that the learner became unresponsive".
  **WHAT WENT WAS THE HEDGE**, and it is the hardest kind of cut to make: the old answer said later
  analysis of Milgram's own archive shows the experimenter improvised more prompting than the
  published account admits. That is true and it is not in any source reachable from here, and an
  uncited hedge is still an uncited claim. It is worth restoring the day the archive work can be
  cited.

· **#133 recalling a memory changes it (FALSE)** — *Psychology 2e* 8.3, on reconstruction and on
  Loftus's misinformation effect. **RECONSOLIDATION WENT**: the word is not on the page, Europe PMC's
  open reconsolidation literature is all animal fear-conditioning rather than the claim as stated, and
  the misinformation half carries the statement on its own.

· **#102 venous blood is not blue (FALSE)** — *Anatomy and Physiology 2e* 18.1: "Blood that has just
  taken up oxygen in the lungs is bright red, and blood that has released oxygen in the tissues is a
  more dusky red … hemoglobin is a pigment that changes color, depending upon the degree of oxygen
  saturation." **THE VEINS WENT.** The old answer explained why veins LOOK blue through the skin,
  which is a real and separate finding about light in tissue, and nothing openable from here carries
  it. The statement is refuted without it — blood is red at both ends of the circuit — so the
  explanation was cut rather than left standing uncited.

· **#112 salt does not make water boil sooner (FALSE)** — *Chemistry 2e* 11.4, which gives the
  mechanism in one sentence: "a solution will require a higher temperature than will pure solvent to
  achieve any given vapor pressure, including one equivalent to that of the surrounding atmosphere."
  **THE MAGNITUDE WENT.** The old answer said cooking quantities move the boiling point "well under a
  degree", which is true and which this page does not state; deriving it from the ebullioscopic
  constant would be Folio's arithmetic rather than the source's claim. The direction is what the
  statement asks about and the direction is what the answer now gives.

**A CONCENTRATION WORTH WATCHING, stated now rather than found later.** T25, T26 and T27 have taken
thirteen citations off `openstax.org` across six of its textbooks. No single statement rests on it
twice over, and it is about six per cent of the pool's whole apparatus — but the Greece collection's
Dartmouth finding is what this looks like early. **Prefer another host where one answers**, and treat
a statement that can ONLY be answered from a first-year textbook as a statement to re-research rather
than to cite a seventh time.

### T28 — one statement, and the four that were researched and refused (2026-09-17)

**One statement, 159 → 160 of 220 (73%).** A short batch, recorded because what it did NOT take is
the more useful half: four physics and chemistry statements were researched to the point of knowing
exactly which sentence is missing, and that is worth having written down.

· **#79 nothing with mass reaches the speed of light (TRUE)** — *University Physics Volume 3* 5.9,
  which states it three ways: "An infinite amount of work … is required to accelerate a mass to the
  speed of light", "No object with mass can attain the speed of light", and "its velocity can only
  approach—not reach—the speed of light". **CHERENKOV CAME OUT OF THIS ANSWER**, and the argument for
  cutting it is better than "unsourced": the statement is about a VACUUM, and the pool already carries
  #163, whose whole subject is that light is slower in matter and particles can outrun it there. One
  fact, one statement.

**Researched and refused, with the missing sentence named in each case.**

· **#163 nothing travels faster than light in any medium (FALSE)** — *University Physics Volume 3*
  1.1 gives the first half exactly ("the speed of light in matter is always less than c", with
  n = c/v worked for zircon). What is missing is Cherenkov radiation: `home.cern`'s own page for it
  is a 404 and OpenStax does not cover it in any chapter reached here. **The statement needs one
  sentence and it is a findable one** — the next attempt should try IceCube, Super-Kamiokande or a
  reactor operator's own explanation rather than a textbook.

· **#166 absolute zero has not been reached (FALSE)** — no source yet for either half. `nist.gov`
  answers but `/topics/physics/laser-cooling` is a 404, and the third-law statement "unattainable in
  a finite number of steps" was not found on the OpenStax entropy page read. The old answer's "within
  a few hundred trillionths of a degree" is a record figure and needs whoever holds the record.

· **#128 a microwave oven does not cook from the inside out (FALSE)** — *University Physics Volume 2*
  16.5 describes the oven properly (a torque on the water molecules' dipoles, standing waves, hot
  spots) and never mentions penetration depth, which is the whole of the refutation. **A page can be
  about the right object and still not carry the claim.**

· **#122 the birthday problem (TRUE)** — *Introductory Statistics 2e* 3.2 and the Contemporary
  Mathematics probability chapter were tried; the classic worked example is in neither, and
  Contemporary Mathematics's multiplication-rule page is a 404 at the obvious slug.

**A workflow note, not a citation one.** The repository's `browser` CI job carries no
`timeout-minutes`, so it inherits GitHub's six-hour default — on a single runner, one hung suite
would block every later run. Worth a line in the workflow the next time it is touched.

### T29 — off the textbook shelf, deliberately (2026-09-17)

**Two statements, 160 → 162 of 220 (74%).** Written to answer T27's own concentration note: neither
citation is OpenStax, and both hosts are ones the pass had recorded as open and then not used.

· **#48 the caesarean section is not named for Julius Caesar (FALSE)** — TWO ANCIENT SOURCES, on two
  different open hosts, each answering half the statement. Pliny (*Natural History* 7.7, on Perseus)
  gives the etymology to an ANCESTOR: "the first, too, of the Cæsars was so named, from his having
  been removed by an incision in his mother's womb." Plutarch (*Life of Caesar* 9–10, on
  LacusCurtius) disposes of the rest: Aurelia is keeping watch over Caesar's wife and putting a stop
  to the Bona Dea rites in 62 BCE, when her son was praetor and about thirty-eight. **THE STATEMENT
  IS COMPOUND AND SO IS THE ANSWER** — the name, and the mother — and each half needed its own source.
  What went is the old answer's claim that in Roman times the operation was performed only on dead or
  dying women. That is very likely true and neither source says it.

· **#99 goldfish do not have a three-second memory (FALSE)** — Liu et al., "Whole Body Motor
  Adaptation in Goldfish Using Fish Operated Vehicle" (*Eur. J. Neurosci.*, 2025), open at Europe
  PMC. Goldfish steering a wheeled tank adapt to a rotational perturbation, show aftereffects once it
  is removed, and **do better when it is re-introduced**, which is retention between sessions. **A
  SAVINGS EFFECT IS THE CLEANEST REFUTATION THERE IS**, because it is memory measured rather than
  inferred.
  **AND THE AUTHOR'S NAME WAS THE TRAP CLAUDE.md WARNS ABOUT.** Europe PMC gives `Liu Z`; the obvious
  expansion is *Zhuo*, it reads perfectly, and Crossref says **Zhuoxin**. One request settled it.
  **Resolve initials against Crossref before writing a citation**, TF statements included — the
  checker that catches this runs over cards, not over this pool.

**Hosts.** `penelope.uchicago.edu` (LacusCurtius) and `www.perseus.tufts.edu/hopper/text` both answer
and are the right shelf for anything ancient. **`bmj.com` is SHUT (403)**, which costs the pool
Vreeman and Carroll's "Festive medical myths" — the one paper that would answer **#124** (body heat
through the head) and **#155** (sugar and hyperactivity) together, and which Europe PMC indexes
without holding the text. Those two remain open and now have a named target.

### T30 — the corpus is the cheapest host there is (2026-09-17)

**Three statements, 162 → 165 of 220 (75%).** Not one new source was researched: all six citations
were LIFTED out of Folio's own cited cards, which after five batches of hunting for open hosts is
plainly the seam to try FIRST rather than last. The recipe is `docs/truefalse-citation-plan.md`'s
own — read the card with its markers visible, find the sentence that carries the claim, take the
citation that sentence points at — and one command over `card-io.js` finds the candidates:

    node -e 'global.window={};const{loadCards}=require("./.claude/card-io.js");const C=loadCards().cards;
      const h=C.filter(x=>/Tenochtitlan/i.test((x.answerText||"")+" "+(x.abstract||"")));
      h.forEach(x=>console.log(x.id,x.answerText))'

· **#19 medieval Europeans did not cook with tomatoes and chillies (FALSE)** — out of `us-041`, the
  Columbian exchange card. Its source 6 is the National Park Service's own page, which puts it
  rhetorically and unambiguously: "no zucchini or tomatoes in Italy … no chile peppers in Thailand …
  This was the world before Columbus' voyages to the Americas." Its source 2 (Myers et al.,
  *Frontiers in Plant Science*) supplies the second half — American beans are not certainly shown in
  European painting until the middle of the 16th century — so the answer can say that arrival was not
  adoption without inventing the point.

· **#62 Oxford was teaching before Tenochtitlan was founded (TRUE)** — out of TWO cards that have
  never met. `wh-511` (the medieval university) cites Rashdall for the list of places answering to
  the name in the second half of the 12th century: "Paris, Bologna, Salerno and Oxford were nearly
  the whole of the list." `gw-511` (Mexico City) cites Matadamas-Gomora et al. for the other end:
  "Tenochtitlan grew on an island in those lakes from about 1375." **A COMPARISON STATEMENT WANTS ONE
  CITATION PER END**, and the two ends are usually in different collections.

· **#11 Cleopatra lived nearer the Moon landing than the Great Pyramid (TRUE)** — three ends, so
  three citations: Egypt's own Ministry of Tourism and Antiquities for Khufu at c. 2589–2566 BCE
  (lifted from `wh-212`), Livius for the Roman annexation in 30 BCE (lifted from `gr-767`), and NASA
  for 20 July 1969. **THE SUBTRACTION IS FOLIO'S AND THAT IS ALLOWED**: every figure is cited and the
  arithmetic IS the statement. What is not allowed is a figure nobody sourced.

**NOT TAKEN, and the reason is a host this file has already recorded.** #8 (the Great Pyramid was
built by paid labourers, not Hebrew slaves) has its source sitting in `wh-212` — UCL's *Digital Egypt
for Universities*, "The workmen at a pyramid" — and **`www.ucl.ac.uk` answers 403 behind a Cloudflare
interstitial**, re-measured today. The bar is one OPENABLE source, so the lift was refused. Breasted
(1905) is open on archive.org and is the wrong authority for this claim, being of the generation that
accepted Herodotus's hundred thousand. **A card may cite a source this pass cannot use**, and the
card is not wrong to: it was reachable when the card was written.

#63 (the Mongol Empire was the largest contiguous land empire) is refused for the same shape of
reason from the other side: `wh-594` carries the claim in its first sentence and points it at
Morgan's chapter in *Beyond the Legacy of Genghis Khan*, which is marked **[Paywalled]**. The card's
four open sources do not carry that claim.

### T31 — a witness who was dead before the question was asked (2026-09-17)

**One statement, 165 → 166 of 220 (75%).** #66, Napoleon's gunners and the Sphinx's nose, and the
citation is worth writing down because of HOW it was found.

The answer already named the right witness — it said Norden's drawings, "made around 1737 and
published in 1755", show the Sphinx noseless — and cited nothing. The obvious way to cite a drawing
is to look at the plate, which cannot be verified from an OCR. **SO THE TEXT WAS SEARCHED INSTEAD, AND
IT SAYS IT OUTRIGHT.** On page 85 of volume 1, describing the walk down from the second pyramid:
"on arrive au Sphinx, dont on admire la grandeur énorme, en concevant une sorte d'indignation pour
ceux, qui ont eu la brutalité de maltraiter étrangement son nez." Published posthumously in 1755 —
the book itself calls it "l'Ouvrage de feu Mr. Norden" — which is more than forty years before the
French landed.

· **THE PAGE NUMBER CAME OUT OF THE RUNNING HEAD, NOT A PAGE MARKER.** `grep -noE "^[[:space:]]*[0-9]{2,3}[[:space:]]*$"`
  found nothing near the passage; what did work was searching for the book's own running title, which
  OCRs as `Nubie. 85` about forty lines above it. **A French 18th-century scan has no clean page
  markers; it has running heads.**
· **THE AUTHOR'S NAME IS THE TITLE PAGE'S, NOT THE CATALOGUE'S.** archive.org files him as "Norden,
  Frederik Ludvig"; the book prints "MR. FREDERIC LOUIS NORDEN", and a citation names the work as the
  work names itself.
· **WHAT WENT** is the answer's second sentence — chisel marks on the face, and a 15th-century account
  blaming a Sufi iconoclast. That is al-Maqrizi on Muhammad Sa'im al-Dahr, it is probably right, and
  nothing openable was found for it today. The statement is refuted without it.

**Two more were researched off the corpus and refused, both for the same reason.** **#119** (the Dead
Sea shore is the lowest exposed land on Earth): `gw-084` gives the figure — "the Dead Sea at 417 m
(1,368 feet) below" sea level — and **no card in the corpus claims it is the LOWEST**, which is the
whole statement. A sweep for `lowest (point|land|exposed|elevation)` over every abstract returns two
hits and neither is about the Dead Sea. **#177** (Leeuwenhoek ground his own lenses): `bio-011` is
Folio's microscope card and does not mention him at all.

### T32 — a host map, and the one statement that came off it (2026-09-17)

**One statement, 166 → 167 of 220 (76%).** The batch is mostly a REACHABILITY sweep, recorded because
the pass keeps rediscovering the same hosts, and because the eight probes cost less than one bad
guess.

· **#34 alternating current won the War of the Currents (TRUE)** — the Department of Energy's own
  article, which carries every part of the answer in order: direct current "is not easily converted
  to higher or lower voltages" while alternating current can be "using a transformer"; Westinghouse,
  holding Tesla's polyphase patents, undercut General Electric to electrify the 1893 Chicago World's
  Fair; the Niagara Falls contract; Buffalo lit from the falls on 16 November 1896; General Electric
  coming over; and "today our electricity is still predominantly powered by alternating current".
  **ONE PAGE ANSWERED A STATEMENT FIVE OTHER BATCHES HAD LEFT ALONE**, which is worth remembering
  about government explainer pages: they are written to narrate rather than to enumerate, and that is
  the shape a True-or-False answer needs.

**Hosts measured this batch (probe only, root or a known page).** **OPEN:** `uspto.gov`,
`energy.gov`, `archives.gov`, `nationalarchives.gov.uk`, `rmg.co.uk` (Royal Museums Greenwich),
`sciencemuseum.org.uk`, `bas.ac.uk`, `nsidc.org`, `nps.gov`, `british-history.ac.uk`,
`penelope.uchicago.edu`, `perseus.tufts.edu`, `archive.org`, `gutenberg.org`, `openstax.org`,
`nobelprize.org`, `mathshistory.st-andrews.ac.uk`, `egymonuments.gov.eg`, `spaceplace.nasa.gov`,
`imagine.gsfc.nasa.gov`, `science.nasa.gov`, `www.nasa.gov`, `crossref.org`, Europe PMC.
**SHUT:** `bmj.com` (403), `www.ucl.ac.uk` (403, Cloudflare interstitial), `ox.ac.uk` (403),
`jpl.nasa.gov` (403), `collection.sciencemuseumgroup.org.uk` (403).
**REACHABLE BUT USELESS** — answers 200 and serves a JavaScript shell with no text in it:
`oldbaileyonline.org`, `sciencemuseum.org.uk/search`, `founders.archives.gov` (202 with an empty
body). **A 200 IS NOT A SOURCE**; grep the fetched bytes for a word the page must contain before
believing it.

**#117 is half done and is left that way deliberately.** The Sahara is not the largest desert, and the
British Antarctic Survey supplies one end — the ice sheet "covers nearly 14 million km²", with
"only centimeters in the interior—classifying much of Antarctica as a desert". What is missing is a
cited area for the SAHARA: the corpus has only the part of it inside one country (`gw-033`, "more
than 2 million km² … some 87 per cent of the territory"), and a comparison with one end cited is not
a cited comparison. The next attempt should look for a whole-Sahara figure rather than re-finding
Antarctica's.

### T33 — the modern paper that corrects the statement it confirms (2026-09-17)

**One statement, 167 → 168 of 220 (76%).**

· **#177 the first person to see bacteria ground his own lenses (TRUE)** — Cocquyt et al., "Neutron
  Tomography of Van Leeuwenhoek's Microscopes" (*Science Advances*, 2021), open at Europe PMC. It
  carries the statement outright — the discovery of "animalcules" marks the birth of microbiology and
  the lenses were "skillfully self-produced", unsurpassed for over 150 years — **and it also
  complicates it, which is why the answer now says both.** The tomography looked inside two surviving
  instruments: the Leiden one's lens is ground and polished in the classical way, and the most
  powerful that survives, at Utrecht, is a blown globule made by the method Hooke popularised in 1678.
  **THE ANSWER SAYS "TWO" BECAUSE TWO IS WHAT WAS SCANNED** — a first draft said "most of them", which
  the paper does not support and which nothing downstream would have caught.

· **THE 18th-CENTURY ROUTE WAS TRIED FIRST AND FAILED.** Hoole's translation of Leeuwenhoek's *Select
  Works* (1800) is on archive.org with full OCR, and grepping it for grinding returns molar teeth and
  spiders: **Leeuwenhoek kept his lens-making secret, so his own letters are the one place the answer
  is not.** The modern instrument study is the source precisely because the primary witness withheld
  it.

**#155 REFUSED, AND THE REASON IS WORTH MORE THAN THE CITATION WOULD HAVE BEEN.** Sugar and
hyperactivity: Europe PMC's best open match is Panayotova and Hachmeriyan, "Dietary Carbohydrates and
ADHD Symptoms: A Systematic Review" (*Nutrients*, 2026), and it **answers a different question and
points the other way**. It reviews dietary PATTERNS against ADHD diagnosis and symptom burden — 15 of
16 studies of added sugars report positive associations — where the statement is about whether a DOSE
of sugar makes an ordinary child hyperactive in the next hour, which is what the double-blind
challenge trials tested. Citing it would have attached a real paper to a claim it does not make, and
the direction of its finding would have sat oddly under a FALSE. **A SOURCE ABOUT THE SAME SUBSTANCE
IS NOT A SOURCE ABOUT THE SAME QUESTION.** The classic refutation is Wolraich's meta-analysis in
*JAMA*, and `bmj.com` and the JAMA network are both shut from here, so #155 and #124 remain blocked on
a host rather than on research.

### T34 — two papers for one statement, because neither carries both halves (2026-09-17)

**One statement, 168 → 169 of 220 (77%).**

· **#118 diamonds are not made from coal (FALSE)** — the mechanism from one paper and the setting
  from another, and that is the point. Rakipov et al. (*Communications Earth & Environment*, 2026)
  open on the sentence the statement needs: "Diamonds crystallise from fluids/melts circulating in the
  Earth's mantle." Timmerman et al. (*Nature*, 2023) supply where and when: sublithospheric diamond
  crystallisation "records the release of melts from subducting oceanic lithosphere at 300–700 km
  depths", and thirteen stones from Juína and Kankan date to between 450 and 650 million years ago.
  **WHAT WENT WAS THE BEST LINE IN THE OLD ANSWER** — "far older than the land plants that coal is
  made from" — because saying so needs a cited date for land plants, and the two papers carry neither
  that nor the old answer's "more than 150 kilometres down" and "over a billion years old". The
  figures now shown are the papers' own, and they refute the statement without the flourish.
  **A FIRST DRAFT RESTED ON THE RAKIPOV PAPER ALONE**, whose only quantities are 5 GPa and 973 °C for
  a Siberian lithospheric diamond; converting 5 GPa to a depth in kilometres would have been Folio's
  geophysics rather than the paper's claim, which is what sent the search after a second source.

**`edisondigital.rutgers.edu` IS A WALL, not an open host.** It answers 200 with 6 KB reading
"Verifying your browser… Powered by Omeka S", which is `check-reach.js`'s `WALL` outcome exactly. That
costs **#75** (the 1947 moth and the word "bug") its primary source: Edison's 1878 letter to Puskás,
where he calls small faults "Bugs", is in that edition. `edison.rutgers.edu` itself answers 200 and its
`/research/quotations` path is a 404, so the letter needs a different route — a printed edition on
archive.org is the next thing to try. **`si.edu` is 403 and `history.navy.mil` fails TLS verification
through the proxy**, so the logbook page with the moth in it is not reachable either.

### T35 — psychology and botany, 3 statements

**169 → 172 of 220 (78%).** A small batch, and its value is in three findings rather than its size.

**A SOURCE WHOSE TITLE FITS CAN STILL CONTRADICT THE CLAUSE IT IS BEING CITED FOR.** #134's `why` ended
*"the confident cues people rely on, such as looking away, are not associated with lying"*, and the
open mock-crime study reached for it (Li et al. 2024) reports that liars in its sample showed **longer
gaze aversion**. The clause was rewritten to what the literature does bear — that individual
behavioural cues are *faint and unreliable*, and that eye-contact avoidance is a **stereotype about**
liars rather than a finding about them, which is Volz et al.'s own wording. **The claim about police
officers being no better than students was dropped outright**, neither open source carrying it.

**AND A GIVEN NAME EXPANDED FROM AN INITIAL WAS WRONG AGAIN.** Europe PMC gives the byline as `Li H`;
the name written from it was *Hanjing Li* and Crossref says **He Li**. That is the fourth time in this
pass and the mechanism is always the same — the invented name reads perfectly, the DOI resolves, and
every checker passes. **Crossref the first author of every citation before it ships.**

**TWO OPEN-ACCESS ARTICLES 403 A SCRIPTED AGENT, AND THAT IS NOT A REASON TO DROP THEM.** `doi.org`
resolved to 403 for MDPI's *Plants* and Sage's *Perspectives on Psychological Science*, and both PMC
mirrors served a **200-status reCAPTCHA wall** rather than the article — the `WALL` outcome
`check-reach.js` records. Both articles are genuinely open: Europe PMC's REST full-text endpoint
serves them, and it serves full text only for open-access records, which is positive evidence
independent of the probe. **So the citation carries the canonical DOI**, which is what a reader's
browser resolves, and the openness was established by reading the text rather than by the status code.
**Do not repoint a walled-here citation at a mirror that is also walled; establish openness another
way and cite the canonical address.**

Sources: Sahromi et al. (*Gates Open Research*, 2026) for the banana's fruit being a berry; Pérez-Rojas
et al. (*Plants*, 2023) for the strawberry's receptacle and achenes; Volz, Reinhard and Müller
(*Perspectives on Psychological Science*, 2023) for the 54% figure and the eye-contact stereotype;
Li et al. (*Frontiers in Psychology*, 2024) for cues being faint and unreliable; Le Texier's PsyArXiv
preprint (2019) for the Stanford prison experiment — the BBC study's different findings, the research
team's instruction that the guards be firmly in control, and Banuazizi and Movahedi's 90% figure.

**AND PDFs ARE READABLE IN THIS CONTAINER AFTER ALL**, which is worth more than the batch. `pdftotext`
is absent and `pdfminer.six` would not install, but `pypdf` does — it simply panics on import because
the system `cryptography` rust binding does, and shadowing that module with one that raises
`ImportError` makes `pypdf` fall back to its own crypt provider and work. That is what got Le Texier's
44-page preprint open. **Reach for it before writing a source off as a PDF.**

### T36 — three physics-and-mathematics statements, and a PDF that had to be de-spaced (2026-09-17)

Three cited: the Cherenkov statement (#164), the birthday problem (#123) and absolute zero (#167).
Coverage 172 → **175 of 220**. Run `node .claude/check-truefalse.js` for the standing rather than
reading a figure back out of this line.

**A NOBEL LECTURE IS A SOURCE, AND IT IS OPEN.** `nobelprize.org` serves every laureate's lecture as a
PDF under a stable `uploads/<year>/<month>/` address, and Cherenkov's 1958 lecture carries the
statement's whole claim in one sentence: *"the light described is produced by the electrons which move
uniformly in the substance at a speed exceeding the phase velocity of light in this medium."* That is
the primary account of the effect by the man who measured it, and it is reachable where every journal
route to the same claim is not.

**THE EXTRACTED TEXT HAD SPACES INSIDE ITS WORDS, AND THE FIX IS TO SEARCH THE FLATTENED STRING.**
pypdf reads that scan as `R a di ati o n of p arti cl es m o vi n g`, so every keyword search over it
returns nothing and the PDF looks unreadable. Stripping **all** whitespace and searching for the
keyword with its own spaces stripped (`velocityexceeding`, `phasevelocity`) finds the passage at once,
and the surrounding 300 characters are perfectly legible once you know to expect no spaces. **A PDF
whose text extracts as gibberish is usually a PDF whose text extracts fine and whose word boundaries
are lost** — check by flattening before writing it off.

**AN OPEN TEXTBOOK CARRIES BOTH HALVES OF A MATHEMATICAL CLAIM, WHICH A PAPER USUALLY DOES NOT.**
Grinstead and Snell's *Introduction to Probability* (AMS, freely distributed) states the birthday
problem, says in terms that the no-duplication probability crosses one half between 22 and 23 people,
and prints the tables the `why`'s two figures are read off — .4927 at 23, so a match at **50.7%**, and
.00084 at 70, so a match at **99.9%**. Diaconis and Mosteller's JASA paper is the scholarly reference
and is closed; the textbook is open, is a published work, and carries more of the statement than the
paper does.

**THE THIRD LAW HAS AN OPEN-ACCESS DERIVATION AND IT IS QUOTABLE.** Masanes and Oppenheim, *Nature
Communications* 8 (2017), CC BY 4.0, opens on the unattainability principle in the exact words the
statement needs — *"any process cannot reach absolute zero temperature in a finite number of steps and
within a finite time"*. `nature.com` serves it to a scripted agent where `doi.org` and every
publisher's own mirror in this batch did not.

**WHAT THE MARKER MAY NOT VOUCH FOR.** #167's `why` had opened *"within a few hundred trillionths of a
degree"*, which is Leanhardt et al., *Science* 301 (2003) — **closed**, with no repository copy
OpenAlex can find and MIT's own group pages 404. The figure is not in doubt and the sentence was
rewritten to *"billionths and even trillionths of a degree above zero, but never zero itself"*, so the
marker at the end of it falls on the half the third-law paper does carry. **Where a sentence mixes a
cited claim with an uncitable magnitude, put the cited claim last.**

**FIVE MORE WERE RESEARCHED AND REFUSED, AND FOUR OF THEM FOR ONE REASON.** The canonical source is
closed and nothing open carries the claim: Zanotto's *Do Cathedral Glasses Flow?* (#82), Shapiro's
bath-tub vortex (#85), Wolraich's sugar meta-analysis (#156) and Manning, Levine and Collins on Kitty
Genovese (#136) are all `closed` in OpenAlex with no OA location at all. The fifth, sharks (#106), has
a perfect source — Ostrander et al., *Cancer Research* 64 (2004) — and **AACR 403s both the article and
its DOI**.

**AND ONE NEAR MISS IS WORTH RECORDING BECAUSE IT WOULD HAVE READ PERFECTLY.** The obvious open source
for #156 is *Dietary Carbohydrates and ADHD Symptoms: A Systematic Review* (**Nutrients**, 2026,
PMC13209895). It is open, current, on the subject and **argues the other way** — it reports positive
observational associations between sugar-sweetened beverages and ADHD symptoms, where the statement
says sugar does not make children hyperactive. The statement rests on double-blind *challenge* trials,
which that review is not about. **A source on the topic is not a source for the claim**, and this pass
has now made that mistake once and caught it twice.

### T37 — the flat-Earth myth and the largest desert, both off open journals (2026-09-17)

Two cited: #17 (educated people in Columbus's time believed the Earth was flat) and #118 (the Sahara is
the largest desert). 175 → **177 of 220**.

**A BOOK REVIEW IS A SOURCE, AND A DIAMOND-OPEN ONE IS REACHABLE WHERE THE BOOK IS NOT.** Jeffrey
Burton Russell's *Inventing the Flat Earth* is the standard work on the myth and is a 1991 Praeger
book with no open copy anywhere. Its 1993 review in *Teaching History: A Journal of Methods* is
**diamond open access** at Ball State's own press, and it restates the book's findings in enough
detail to carry the statement: that the misperception "is not true, but widely believed", that "the
true shape of the world as well as its size were relatively well established by the third century
B.C. by Hellenistic scientists and certainly known to the learned of the Middle Ages", and that
"Columbus's measurement of the earth's circumference was actually less accurate than that of many of
his contemporaries". **Look for a review when the monograph is closed** — and cite it as a review,
reviewer first, which is also the shape `card-focus.js` parses.

**THE `why` WAS NARROWED TO WHAT THE REVIEW SAYS.** It had read "he underestimated both" the size of
the globe and the width of the ocean; the review says his measurement was *less accurate than many of
his contemporaries'*, which is a different and weaker claim, so the sentence now says that. **A
citation is not a licence to keep the stronger wording.**

**AND THE `De sphaera` DETAIL EARNED ITS OWN SOURCE.** Oosterhoff's chapter in *De sphaera of Johannes
de Sacrobosco in the Early Modern Period* (Springer, 2020, CC BY) says the treatise "was already
established as a standard textbook in the late Middle Ages" and describes the diagrams that argue
sphericity — the stick figures walking round the globe, the ship whose lower sailor's line of sight is
"blocked by the earth's bulge". **Springer 403s a scripted agent and OAPEN 403s too**, but the whole
book is on archive.org as `oapen-20.500.12657-22845` with a `_djvu.txt`, which is how it was read. The
citation carries the chapter DOI, per T35's rule.

**#118 WAS HALF-SOURCED FOR THREE BATCHES AND THE MISSING HALF WAS ONE SENTENCE IN A MICROBIOLOGY
PAPER.** NSIDC gives the Antarctic ice sheet's area and no definition of a desert; the British
Antarctic Survey's geography page does not use the word at all. Lambrechts, Willems and Tahon's
*Frontiers in Microbiology* review of Antarctic soils opens on **both halves at once**: "Antarctica,
the largest desert on Earth", and "Antarctica is therefore the largest, but also coldest desert on
Earth, since desert climates are characterized by annual precipitation rates of less than 250 mm water
equivalent." **A paper's INTRODUCTION is where a field states what everybody in it takes for granted**,
which is exactly the kind of claim a statement like this needs and which no paper's title will ever
advertise. Europe PMC's full-text search is the way in.

**AND THE SAHARA'S OWN FIGURE CHANGED, WHICH IS THE POINT OF CITING IT.** The `why` had said 9.2
million square kilometres from nowhere in particular; the source found for it — a *Frontiers in
Nutrition* review of Algerian Saharan flora, which calls the Sahara "the largest hot desert in the
world" — puts it at **about 8.5 million**. The figure written is now the figure cited.

### T38 — ether before antisepsis, and a spelling the table cannot reach (2026-09-17)

One cited: #77. 177 → **178 of 220**. Three sources, because the statement spans two events twenty
years apart and a third fact about the gap between them: Makris et al. (*Annals of Surgery Open*,
2022) for Ether Day, 16 October 1846; Michaleas et al. (*Cureus*, 2022) for Lister's first carbolic
dressing of compound fractures in 1865 and his six *Lancet* papers of 1867; and Schlich and Strasser
(*Medical History*, 2022) for what the twenty years in between were like — "By the mid-nineteenth
century, operative surgery was in deep crisis … many patients eventually died from these septic
complications."

**TWO OF THE THREE 403 AT `doi.org` AND BOTH ARE GENUINELY OPEN** — Lippincott and Cureus — read in
full through Europe PMC's REST full-text endpoint, which serves full text only for open-access
records. T35's rule applied without change: cite the canonical DOI, establish openness by reading the
text.

**THE WORD `anaesthesia` IS NOT IN `SPELL_PAIRS`, AND THE CORPUS HAS ONE OF EACH.** Measured over the
cards and this pool: `geo-033` writes the British form and this statement wrote the American one, and
nothing anywhere could see it — `check-truefalse.js` rule 2 tests the families the TABLE names, so a
family nobody has added is a family nobody can check. The statement is now British, which is the house
form and what the one card already does; **a reader of either spelling still sees whichever is
authored**, since with no row there is nothing for the transform to convert. It is the `per cent` gap
CLAUDE.md records, one word over, and at this size it is a one-word fix rather than a pass.

### T39–T40 — two eighteenth-century primaries off archive.org and one university edition (2026-09-17)

Two cited: #34 (Franklin's kite struck by lightning) and #18 (the Salem accused burned at the stake).
178 → **180 of 220**.

**THE EXPERIMENTER'S OWN ACCOUNT IS THE SOURCE, AND IT IS THREE CENTURIES OLD AND OPEN.** Franklin's
kite letter is Letter X of *New Experiments and Observations on Electricity* (3rd ed., London, 1760),
106–7, on archive.org with a `_djvu.txt`. It carries the refutation in its own words: a sharp wire at
the top of the kite "will draw the electric fire from" the thunder clouds, and "the person who holds
the string must stand within a door, or window, or under some cover, so that the silk ribbon may not
be wet". **That is a charge collected, not a bolt received**, stated by the man who designed the
experiment — and no modern secondary source says it better.

**THE SECOND HALF NEEDED A SECOND EIGHTEENTH-CENTURY BOOK.** Richmann's death is in Priestley's
*History and Present State of Electricity* (2nd ed., 1769), 338–39, which has the eyewitness engraver
Sokolov watching "a globe of blue fire … as big as his fist, jump from the rod of the gnomon towards
the head of the professor". **The year was dropped from the `why`** because Priestley's page does not
give one and 1753 was not going to be asserted on a marker that could not carry it.

**A DOCUMENTARY EDITION IS A SOURCE, AND THE SALEM ONE IS OPEN.** `salem.lib.virginia.edu` serves the
*Salem Witchcraft Papers* free, one numbered file per accused. Bridget Bishop's is SWP no. 013 and
carries both the warrant and the sheriff's return — "cause her to be hanged by the neck untill she be
dead", and "Caused the s'd Brigett to be hanged by the neck untill Shee was dead". **A death warrant
answers this statement more directly than any history of the trials could.** Giles Corey is SWP no.
037, whose heading is "Pressed to Death, September 16, 1692".

**AND THE `why`'s LEGAL EXPLANATION WAS DROPPED FOR WANT OF A SOURCE.** It had ended "as colonial
Massachusetts followed English law, under which burning was not the penalty for witchcraft" — true,
and nothing reachable here states it. Blackstone's Book IV would, and finding the passage is a volume
download and a hunt; the Witchcraft Act's own text is another. **Left out rather than left standing
under a marker that does not reach it**, and recorded here so the next batch knows it is one lookup
away rather than a research problem.

**Both these statements were reached by looking for the DOCUMENT rather than the literature**, which
is where the remaining pool divides: what is left is mostly either a modern finding behind a closed
journal (#82, #85, #106, #136, #156) or an event with a surviving record (#26 the Bastille's seven
prisoners, #65 the Great Fire's death toll, #29 the O.K. Corral, #33 Newton at the Mint, #73 the emu
cull). **The second group is the cheap one and should be worked first.**

### T41 — Newton at the Mint, and the pamphlet that names the hanging (2026-09-17)

One cited: #33. 180 → **181 of 220**. Brewster's *Memoirs of the Life, Writings, and Discoveries of Sir
Isaac Newton* (1860) is on archive.org in both volumes with full text: volume 1 carries "his
appointment to the Wardenship of the Mint in 1696, and to the Mastership in 1699", and volume 2 carries
William Chaloner across pages 144–48, quoting the 1700 pamphlet *Guzmanus Redivivus* on "the Notorious
Coyner, who was executed at Tyburn" and Chaloner's own accusation, put before a parliamentary
committee, against "that worthy gentleman, Isaac Newton, Esq., Warden of His Majesty's Mint".

**THE OFFICE MATTERED AND THE `why` NOW SAYS SO**: prosecuting coiners was the WARDEN's business, and
Newton was Warden when Chaloner hanged, Master only from that year. The statement is still true as
put — he was both — but a `why` that runs the two offices together loses the thing that makes the
story worth telling.

**TWO OBVIOUS ROUTES TO THIS ONE ARE SHUT AND ARE WORTH RECORDING.** `oldbaileyonline.org` serves a
1.2 KB JavaScript shell for its home page and **resets the connection** on a trial record, so the
Proceedings are not reachable here; and Craig's *Newton at the Mint* (1946) is on archive.org as a
LENDING item, whose `_djvu.txt` answers **401**. A 401 from `archive.org/download` means borrow-only
rather than absent — check the item's own metadata before assuming the book is not there at all.

**AND THE BASTILLE (#26) WAS ATTEMPTED AND LEFT.** Persée answers and is full of scholarship on the
14th of July, and none of the first two pages of results is about the seven prisoners found inside;
the figure lives in the Bastille's own register and in book-length accounts. It is the next one to
try, and it wants a different search rather than a different host.

### T42 — three statements settled from the primary document itself (2026-09-17)

Three cited: #78 (Bell and Gray), #74 (Crapper), #72 (the emu cull). 181 → **184 of 220**. Every one
of them was answered by the record the event itself generated, and none by a modern study, which is
the division the T41 entry above predicted.

**A COURT'S OWN OPINION SETTLES A DATE NO SECONDARY ACCOUNT CAN.** Cornell's Legal Information
Institute serves *The Telephone Cases*, 126 U.S. 1 (1888) whole and open, and the opinion says the
thing outright: "Bell's application was filed February 14, 1876, and afterwards, during the same day,
Elisha Gray filed a *caveat*". It also carries the charge the shared date produced — that Bell's
specification was altered between the 14th and the 19th — and the court's answer, that "not a shadow
of suspicion can rest on any one". `supreme.justia.com` is 403 here; **LII is the open route to a
United States case and should be reached for first.**

**AND `PROPER_NOUNS` MASKS A FULL NAME, NOT A SURNAME.** The first draft wrote "Gray's side argued",
and rule 2 reported it: `spellText` has a `gray`/`grey` row and the checker's exception table holds
the string *Elisha Gray*, so the bare possessive fell outside the mask. **The fix is the prose, not
the table** — a bare-surname exception would excuse a real American spelling of the colour — so the
sentence was reworded to name the date rather than the man. Worth knowing before writing about him
again.

**A PATENT INDEX IS A SEARCHABLE PRIMARY SOURCE AND IT IS ON archive.org.** Woodcroft's *Titles of
Patents of Invention, Chronologically Arranged* (1854) lists every British patent from 1617 to 1852
with its own full text, and patent 1105 reads "a grant unto Alexander Cumming, watchmaker, of his new
invented watercloset, which he apprehends will be of great publick utility", dated in the margin
11 November 1775. **The entry number is the way in**: a search for the patentee found two other
Cummings and not this one, the OCR having read the surname as "Cummino", where `^1105\.` found it at
once. The 1814 reprint of Harington's *Metamorphosis of Ajax* supplies the other half, its editor's
advertisement establishing the 1596 printing.

**HANSARD IS ONLINE, FREE, AND FULL-TEXT AT `historichansard.net`.** It answers 200, serves a whole
sitting day as one page with the printed page numbers inline, and indexes by year and chamber — so
the Australian emu operation of 1932 can be read in the words of the men who ordered it. The Senate
of 18 November (p. 2569) has the Minister for Defence explaining that rifles were useless because the
birds scattered, and that he lent two guns and three regular soldiers; the House of 22 November
(p. 2634) has a member asking whether the "Emu war" had been "an expensive failure" and the answer
naming the gun crews and "some hundreds of emus". **`trove.nla.gov.au` is an Anubis bot wall** and
`parlinfo.aph.gov.au` is 403, so this is the route.

**AND `grep -i emu` MATCHES "remuneration".** The first sweep reported the word on twenty-six sitting
days and three of them were real. A three-letter search term over a parliamentary record is a search
for the language, not for the subject; the count is worthless and only reading the hits settles it.

### T43 — a statement rewritten because no open source carries its figure (2026-09-17)

Two cited: #23 (Napoleon's height), #71 (Washington's bleedings). 184 → **186 of 220**. Both also
cleared the two remaining unit findings, which is not a coincidence: a statement written from memory
tends to be written in whichever units the memory came in.

**THE AUTOPSY SETTLES NAPOLEON, AND IT SETTLES IT BY CARRYING ITS OWN CONVERSION.** Antommarchi's
*The Last Days of the Emperor Napoleon* (1825) prints the post-mortem report, whose fourth item gives
the body at "five feet two inches and four lines" and whose own footnote adds "French measure; equal
to five feet six inches" English. **The source does the work the statement is about** — there is no
need to reason about the length of a *pouce*, because the document beside the figure already has. The
`why` was also the wrong way round for the units pass, giving feet first and metres in brackets, so
nothing could convert it for either reader; it now reads about 1.69 metres (5 feet 6 inches).

**AND #71 WAS REWRITTEN RATHER THAN CITED, WHICH IS WHAT THE TOOL'S `q` FIELD IS FOR.** It claimed
Washington's doctors drained "roughly 40 percent of his blood", which rests on a modern estimate of
his total blood volume: Cheatham's paper in *The American Surgeon* (2008) is closed, Vadakan's in
*The Permanente Journal* is not in Europe PMC at all, and **founders.archives.gov answers 202 with an
empty body** while mountvernon.org is behind Cloudflare — so the figure has no open source here in
any form. What the record does carry is better: Tobias Lear was in the room, and his journal of
14 December 1799 has four separate bleedings, Martha Washington begging that not too much be taken,
and the General putting up his hand to stop her and saying "More, more". The statement now says that,
and is still true. **A statement whose figure cannot be shown should be rewritten to what the witness
saw, not propped up with a source that does not carry it.**

**WHAT IS LEFT, RE-DIVIDED.** 34 uncited. The modern-finding group is unchanged (#82, #85, #106,
#136, #155). The surviving-record group is now #1 (the terracotta well), #8 (Giza), #20 (Columbus),
#25 (the Bastille's prisoners), #28 (the O.K. Corral), #64 (the Great Fire's death toll), #70
(cocaine in Coca-Cola), #75 ("bug" before the 1947 moth) and #78's neighbours in the invention
category. **#75 was attempted and left**: the Smithsonian's record of the Mark II logbook is 403,
`history.navy.mil` fails TLS verification through this proxy, and the Edison Papers' digital edition
(`edisondigital.rutgers.edu`) is a bot wall, though `edison.rutgers.edu` itself answers — so the 1878
"bugs" letter wants a different route, most likely a Victorian electrical dictionary on archive.org.

### T44 — "bug" in a dictionary fifty years before the moth (2026-09-17)

One cited: #75. 186 → **187 of 220**. Sloane's *Standard Electrical Dictionary* of 1897 settles it in
one line — "**Bug.** Any fault or trouble in the connections or working of electric apparatus" —
with a second entry for the "bug trap" that cured one and the note that both terms "originated in
quadruplex telegraphy". Hawkins' dictionary of 1910 carries the same sense. The moth of 1947 is real
and is not in the citation at all, because it does not need to be: a word a reference work defined in
1897 was not coined in 1947.

**A DICTIONARY IS CITED BY HEADWORD, NOT BY PAGE**, which is Chicago's own rule for a reference work
and is the right one here for a second reason: an OCR'd page number is a guess. Sloane's running
heads number the versos and print a bare figure on the rectos, so the entry could be read as page 92
or 93 by eye; `s.v. "Bug"` is exact, checkable and cannot be wrong.

**AND THE ROUTE IS WORTH KEEPING: A PERIOD DICTIONARY IS THE CHEAPEST PROOF THAT A WORD IS OLDER THAN
A STORY ABOUT IT.** The obvious sources were all shut — the Smithsonian's record of the logbook is
403, `history.navy.mil` fails TLS verification through this proxy, and the Edison Papers' digital
edition is a bot wall — and none of them would have been better than this, because each proves the
moth rather than the word. **Ask what the statement actually turns on before choosing a host.**

### T45 — two statements answered by an open paper's own opening sentence (2026-09-17)

Two cited: #119 (the Dead Sea), #152 (glass recycling). 187 → **189 of 220**. Neither needed a
specialist search, and that is the finding worth keeping: **both claims are the kind a paper states
flatly in its INTRODUCTION as background, so the search term is the CLAIM rather than the subject.**
A microbiology paper on Dead Sea halophiles opens "The Dead Sea, located 430 meters below sea level,
is the lowest point on Earth", and a materials review on waste glass says glass "can be recycled
infinitely without degradation of its molecular structure (typically observed with thermoplastic
polymers, which undergo chain cracking upon remelting)". This is the T36 rule — a field states what
everybody in it takes for granted where it sets up its own problem — used deliberately rather than
met by accident.

**The glass paper also supplies the statement's own contrast**, naming the material where the belief
IS true, which is worth more on a True-or-False card than a bare refutation: the reader is left with
why they thought it, not just that they were wrong.

**FULL GIVEN NAMES COME FROM CROSSREF, NEVER FROM EUROPE PMC.** Europe PMC's `authorString` is
initials and its full text often carries no `<given-names>` at all — the Dead Sea paper's XML yielded
an empty author list — and `docs/citation-plan.md` records what happens when an initial is expanded by
hand. One `api.crossref.org/works/<doi>` call gives the given names, the volume, the issue and the
article number together.

**AND TWO NEAR MISSES ARE WORTH RECORDING.** `bmj.com` is 403 here and so is `doi.org` for a BMJ DOI,
but the Wayback Machine serves the 2008 *Festive medical myths* capture — which carries the whole
"sugar causes hyperactivity" section (twelve double-blind trials, no behavioural difference, the
parents' own perception reversed) and then stops at "View Full Text", so the head-heat section is
behind the paywall. **#155 is NOT cited from it all the same**: a 2026 review in *Nutrients* argues
the other way, so the statement now needs the acute-behaviour literature stated as such rather than a
flat refutation, and that is a rewrite rather than a citation. **Note also that web.archive.org
answered 503 and then served on a retry** — a 5xx here is the BUSY state, not a wall.

### T46 — the Mongol empire, measured rather than asserted (2026-09-17)

One cited: #63. 189 → **190 of 220**. Turchin, Adams and Hall's survey of sixty-two historical
empires in the *Journal of World-Systems Research* — open access, PDF served whole at
`jwsr.pitt.edu` — calls the Mongol empire "the largest historical empire in terms of contiguous
territory" in its own prose, puts it at 24 Mm² in its table, and names "the next largest state in
history after the Mongols", the Russian empire at 22.8 Mm² in 1895. **A superlative is best cited
from the study that ranked the field**, not from a work about the subject: the source has to have
looked at the competitors for the claim to mean anything.

**AND IT EXPLAINS ITS OWN EXCLUSION**, which the statement needs: the paper leaves the European
maritime empires out "because these empires were not contiguous (widely distributed collections of
territories)" — so the reader is told why a larger empire does not count rather than being asked to
take the word "contiguous" on trust.

**AN OJS ARTICLE PAGE IS NOT THE PDF AND THE OBVIOUS LINK IS NOT EITHER.**
`…/article/view/369/381` looks like the file and serves a viewer page; the download is at
`…/article/download/369/381/454`, whose third segment appears only in that viewer's own HTML.
**Fetch the viewer and read its `article/download` href.**

**AND EUROPE PMC IS A BIOMEDICAL INDEX — it is the wrong instrument for a history statement.** Three
searches there for Chang'an, Zheng He and shark neoplasia returned Chinese herbal medicine, one
unrelated PLOS paper and koi carp. What is left in the pool leans historical, so the indexes that
will carry it are DOAJ, OpenAIRE, Persée and the journals' own sites, with Europe PMC reserved for
the medical and biological statements (#105, #124, #128, #155).

### T47 — the tank named by its own committee's secretary (2026-09-17)

One cited: #73. 190 → **191 of 220**, and this one CORRECTED the explanation rather than merely
sourcing it. Albert Stern was secretary of the Landships Committee and published his log-book in
1919, out of copyright and on archive.org with full text. His account of 20 October 1915 is that
d'Eyncourt proposed referring to the machines as a "Water Carrier"; that Stern objected because "in
Government offices, committees and departments are always known by their initials", which made that
title "totally unsuitable"; and that "in our search for a synonymous term, we changed the word 'Water
Carrier' to 'Tank', and became the 'Tank Supply', or 'T.S.' Committee. This is how these weapons came
to be called 'Tanks'." The Committee of Imperial Defence recommended the name that December, again
"for secrecy's sake".

**THE `why` HAD THE FOLK VERSION** — that factory workers called them tanks because they resembled
the steel water tanks they were told they were building. Stern's is a cover WORD chosen in a
committee room, not a cover story believed on a shop floor, and it is the better story besides.
**Where a participant published a log-book, the folk version is what the citation is FOR.**

**AND STERN DECLINES TO SPELL THE JOKE OUT, SO NEITHER DOES THE `why`.** He writes only that
committees are known by their initials and that the title was therefore unsuitable; the `why` quotes
him and lets the reader arrive at W.C. **Do not write the inference into the explanation as though
the source had made it.**

**A 1919 MEMOIR BY A PARTICIPANT IS THE CHEAPEST SOURCE THERE IS FOR A FIRST WORLD WAR ORIGIN
STORY** — out of copyright, full-text on archive.org, and written by somebody in the room. Stern's
volume also has the naming on page 39 and the December decision on page 48, so one citation carries
both halves.
