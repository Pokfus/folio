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
| T4 | Modern history | part done |
| T5 | Medieval & early modern | nothing in the corpus yet — research |
| T6 | Science & invention | the hardest; see the three below |
| T7 | Biology / Medicine | `bio-` and `ps-` cards carry some |
| T8 | Physics / Chemistry / Mathematics | little in the corpus; research |
| T9 | Astronomy / Earth science | little in the corpus; research |
| T10 | Psychology | `ps-` cards carry some |

## Open questions carried forward

Three statements are known to need work and are recorded here rather than left to be rediscovered.

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
