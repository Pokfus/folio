# ADDENDUM — the Ancient Rome run (rm-). Read AFTER BRIEF.md; where they differ, THIS wins.

## The run
- Prefix `rm-`; the cards are Ancient Rome (`col-40`), plan `docs/rome-card-plan.md` (read the line for your
  card and the deck heading only). Rules: `docs/rome-refinement-audit.md` "The rules" (read it — ~60 lines)
  and `docs/rome-chronology.md` "Conventions" (read it).
- EVERY harness call carries the prefix: `REFINE_PREFIX=rm- WH_S=$S node .claude/wh-refine/precheck.js rm-NNN`.
  Without `REFINE_PREFIX=rm-` precheck runs the World History audit and is wrong.
- `$S/index.tsv` lists all 1000 `rm-` cards (id, answer, question) for sibling checks.
- You draft only. Never write under /home/user/folio, never run add-card.js without --dry-run, never git.

## What Rome adds (hunt these first)
1. **Legend told as history.** Romulus and Remus, the seven kings, the Sabine women, Horatius, Lucretia,
   Brutus, Cincinnatus, Coriolanus, the Horatii: these are what LIVY / DIONYSIUS / PLUTARCH report, written
   centuries later. The card says so in its own voice: "Livy tells…", "the Roman tradition held…", "the
   story ran…". Never state a legendary act as an event. What archaeology shows is stated separately and
   never used to "prove" the story.
2. **A legendary date is labelled.** 753 BCE (founding), the regal reigns, 509 BCE (first consuls) and the
   early-Republic years are an ancient reckoning (Varro's era, followed by the collection). The date-line
   label says `Traditional` (or `By tradition`) and the prose names whose reckoning it is. NEVER a value like
   "after 753 BCE" — it dates nothing; give the traditional reign/year or no row.
3. **A modern scholar's idea as ancient fact** ("Pax Romana", "Marian reforms", "Servian constitution" as one
   man's programme, "Villanovan" as a people's own name): say whose idea or name it is, or reword.
4. **A date belonging to another event** (vowing vs dedication of a temple; a discovery year vs the thing's
   age; one site's date given to a whole culture or region).
5. **A figure no source gives** — population, army size, casualties, areas, lengths. Ancient figures are
   reported as the ancient author's ("Livy gives 80,000"), modern estimates as estimates with a range.
- Inscriptions and coins are contemporary evidence: where a claim rests on one, name it and cite a record a
  reader can open (EDCS, EDH, Ubi Erat Lupa, a museum page), never a dealer.

## Date line (on top of BRIEF)
- BCE/CE only; NEVER "BC", "AD", "AUC" on the line. A year under 1000 carries its era; a span across the era
  carries both (`27 BCE – 14 CE`). `c.` at the front of a range only. Never "7th century BCE" on the line —
  write `c. 700 – 600 BCE`. Never a decade.
- ONLY dates on the line: no counts ("12 lictors", "244 years", "6 – 16 million") — those go in prose.
- A geographic feature or a timeless concept: `""` and `"undatable": true` where BRIEF requires it.
- Give `"pins"` only figures that are ON your date line, e.g. `"753; 509"`.

## Sources (on top of BRIEF)
- An ANCIENT author (Livy, Polybius, Dionysius, Plutarch, Strabo, Pliny, Tacitus…) in at most 2 sources on a
  card (3 only if the card is about that author or work); at least HALF the sources modern scholarship
  (a museum or university page counts as modern). Ancient texts: Perseus, LacusCurtius
  (penelope.uchicago.edu), Livius.org, archive.org — cite translator and edition as read off the page.
- Hosts that ANSWER: Livius.org, Perseus (perseus.tufts.edu), LacusCurtius, archive.org (full text via
  `https://archive.org/stream/<id>/<id>_djvu.txt`), Europe PMC (full text XML), BMCR (bmcr.brynmawr.edu),
  doi.org for open-access journals, university repositories, Crossref API.
- Hosts that DO NOT: Wikimedia/Wikipedia/Commons (make NO calls at all — see images), PMC article pages
  (CAPTCHA — use Europe PMC), UCL, the Met's essays, the British Museum, OpenEdition, Persée, Britannica,
  UNESCO, Wayback. Do not spend more than one try on a host that fails; pick another source.
- Non-English source: at most one per language, with its chip (` [in Italian]`) before the access tag.
  Italian archaeology is fine and often the best source for this deck — chip it.
- Never cite Wikipedia. Never invent a date, name, figure, DOI, URL, page number or author first name.

## Images — PAUSED
Wikimedia answered 429 this session. Make no Wikimedia calls; OMIT `image` from the patch (the current picture
stays). In `notes`, one line: "image: <ok | wrong because …>" judged from the current image's title/desc/credit
in cur/<id>.json (e.g. a painting or a drawing where a photo would do, a map with burned-in labels, a single
object standing for a whole culture, a description that names its source).

## Locator
- `null` KEEPS the card's existing locator. Give a request only to ADD a missing one or CORRECT a wrong one.
- A river: `{ "title": "Tiber", "kind": "river" }`. Mountain ranges and regions need hand-drawn shapes:
  `null` (keep what is there) and say in notes if it looks wrong.

## Overlapping collections
For a subject a `gr-` or `wh-` card also covers (grep `$S/index.tsv` won't show them; use
`cd /home/user/folio && node -e "global.window={};const {loadCards}=require('./.claude/card-io.js');const {cards}=loadCards();cards.filter(c=>/^(gr|wh)-/.test(c.id)&&/TERM/i.test(c.answer+' '+c.question)).forEach(c=>console.log(c.id,c.answer,'|',c.answerDate.replace(/<[^>]+>/g,' ')))"`),
read it and note any disagreement (a date, a figure, a claim) in `notes` as "overlap: wh-NNN says X; this card
says Y because Z". NEVER edit it.

## Final reply
One short line per card: id, sources old→new, the main correction, and the image note. Under 150 words.

## Lessons from B1–B2
- A book or chapter with a DOI is cited with the YEAR Crossref gives for it (check-citations compares them);
  an open-access e-book's later date is not the citation year.
- science.org answers 403 here: cite an open Science Advances paper by its DOI only if you read its Europe PMC
  full text, and say so in notes.
- Never convert a regnal or consular year into a BCE year yourself ("Romulus's 4th year = 750 BCE"):
  print only a BCE year a source prints. A conversion is a figure no source gives.
- If the card has a `leadsTo` (see cur/<id>.json) and your new date line moves its start, check each target
  still starts LATER; add-card.js refuses a backward link at apply time and precheck does not catch it. Say
  in `notes` "leadsTo rm-NNN now runs backwards: delete" and the harness owner removes it.
- `S.chip?` on an ENGLISH review (BMCR etc.) of a book with a German/Italian/French title is the audit's known
  false positive (the Greece audit documents it). Do NOT drop a needed source for it: keep it, and say in
  notes "S.chip? false positive: English review". Only a source actually written in another language needs
  the chip.
