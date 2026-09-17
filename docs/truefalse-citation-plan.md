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
| T2 | Ancient & classical | part done; Greece and Rome cards carry most of it |
| T3 | Chinese history | part done; `cnh-` cards carry most of it |
| T4 | Modern history | part done; T4a took three of it |
| T5 | Medieval & early modern | nothing in the corpus yet — research |
| T6 | Science & invention | the hardest; see the three below |
| T7 | Biology / Medicine | part done; T7a took six, all researched |
| T8 | Physics / Chemistry / Mathematics | little in the corpus; research |
| T9 | Astronomy / Earth science | part done; T9a took four off NASA, NOAA and NIST |
| T10 | Psychology | `ps-` cards carry some |

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
