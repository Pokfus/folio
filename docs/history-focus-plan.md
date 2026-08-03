# Folio is a history site, not an archaeology site — the rewrite plan

*Opened 2026-08-03, on request: "we are a history website, not an archaeology website. Some cards (like
Knossos) seem to be more focused on the excavations than the actual history of the site."*

Not part of the site.

## The rule (now in CLAUDE.md, binding on every future card and glossary term)

**A card is about the PAST it names, not about the people who dug it up.** The excavation is how we know;
it is not what the reader is here to learn. So:

- **The question must be answerable from the past, not from the dig.** A clue built on who excavated a
  site, in what year, and after which rival failed to get permission, teaches a reader the history of
  archaeology. `gr-008`'s opening question was *"Schliemann tried to arrange a dig at ___ and never came
  to terms with the owners…"* — a reader could answer that knowing nothing whatever about Bronze Age
  Crete.
- **At most about two of an abstract's ten sentences may be discovery history**, and they earn their place
  only when the discovery is itself the fact worth knowing (the first *H. erectus* ever found; the fossil
  that founded a genus) or when the dating is contested and the reader needs to know why.
- **The date line carries the dates of the THING, not of the dig.** `Found`, `Excavated`, `First dug`,
  `Named` and `Published` are labels about modern scholarship. They belong on a card whose subject IS a
  modern act — `wh-006` (the three-age system), `gr-007` (Arthur Evans) — and nowhere else. Prefer
  `Built`, `In use`, `Occupied`, `Lived`, `Era`, `Destroyed`, `Abandoned`.
- **Where a modern name is unavoidable, keep it to a subordinate clause.** "Dated to about 430,000 years
  ago" beats "excavated from 1978 by the Atapuerca Project and dated to about 430,000 years ago".
- **Restoration and display are history too, but of a different subject.** Evans's concrete at Knossos is a
  fact about the 20th century. It belongs on the card about Evans.

**What does NOT change:** citations, hedging and the sourcing bar. Saying less about the dig is not saying
less about how we know — the apparatus at the foot of the card is where that lives, and it is already at
the 5-source bar on all 119 cards.

## How the flagged cards were found

`node` over `data.js`, counting for each card (a) how many of its ten abstract sentences carry a year
between 1800 and 2029, (b) whether its *question* carries one, and (c) whether its date line uses a
discovery label. A card is flagged at 4+ modern sentences, or 3+ with a modern question or a dig date
label. That is a proxy, not a verdict — **read the card before rewriting it**, because on a handful of
these the modern years are the subject (`gr-007` Arthur Evans is a biography and is *supposed* to be full
of them, and `wh-106` Blytt–Sernander is a card about a 19th-century idea).

**24 of 119 cards were flagged when this was written; 23 are now** — `gr-008` came off it with H1. The
measure is repeatable; re-run it after each batch. The table below is the original reading, kept as the
baseline rather than edited card by card; run the measure for the current state.

| card | answer | modern sentences | modern question | dig date labels |
|---|---|---|---|---|
| `wh-029` | Atapuerca Mountains | 7/10 | — | Excavated |
| `gr-007` | Arthur Evans | 6/10 | yes | Excavated |
| `wh-025` | Java Man | 6/10 | yes | Found, Named |
| `wh-060` | Lake Mungo remains | 6/10 | — | Found |
| `wh-085` | Cave of Altamira | 6/10 | yes | — |
| `wh-017` | Olduvai Gorge | 5/10 | — | Excavated |
| `wh-037` | Homo naledi | 5/10 | — | Found, Named |
| `gr-008` | Knossos | 4/10 | yes | First dug |
| `wh-034` | Neanderthal | 4/10 | yes | Named |
| `wh-035` | Denisovans | 4/10 | — | — |
| `wh-036` | Denisova Cave | 4/10 | — | Found |
| `wh-039` | Liang Bua | 4/12 | yes | Excavated |
| `wh-065` | Châtelperronian | 4/10 | — | Named |
| `wh-067` | Lion-man | 4/10 | — | Found |
| `wh-018` | Homo erectus | 3/10 | — | Named |
| `wh-024` | Dmanisi | 3/10 | — | Found |
| `wh-026` | Peking Man | 3/10 | yes | Named |
| `wh-030` | Homo heidelbergensis | 3/10 | yes | Named |
| `wh-038` | Homo floresiensis | 3/10 | yes | Found, Named |
| `wh-051` | Blombos Cave | 3/10 | — | Excavated |
| `wh-066` | Aurignacian | 3/10 | — | Named |
| `wh-068` | Hohle Fels | 3/10 | — | Excavated |
| `wh-094` | Monte Verde | 3/10 | — | Found |
| `wh-096` | Doggerland | 3/10 | — | Named |

## The batches

Grouped so that each batch shares a body of reading, which is what makes the research economical — the
same lesson the citation pass learned. **Every rewrite keeps the card's existing sources and markers, or
replaces them properly**: a sentence that goes must take its marker with it, and `add-sources.js` refuses a
card whose sources are no longer all referenced.

| batch | cards | shared spine |
|---|---|---|
| **H1 — DONE** | `gr-008`, `gr-010` | Minoan Knossos as a place: what the palace was for, who lived in it, what it controlled. `gr-007` already exists to carry Evans, so `gr-008` handed him over wholesale rather than trimming him. Shipped 2026-08-03 along with the other eight Bronze Age Aegean cards — see below. |
| **H2** | `wh-029`, `wh-024`, `wh-051`, `wh-068` | Sites whose interest is what people DID there: Atapuerca's Sima de los Huesos as a mortuary deposit, Dmanisi as the first hominins out of Africa, Blombos and Hohle Fels as the earliest art. Each currently opens on the dig. |
| **H3** | `wh-025`, `wh-026`, `wh-018`, `wh-030` | *Homo erectus* and its named finds. Java Man and Peking Man are genuinely discovery stories, so these keep the most modern history of any batch — but the ratio should invert: the species' range, dates and way of life first, the finding second. |
| **H4** | `wh-034`, `wh-035`, `wh-036`, `wh-037`, `wh-038`, `wh-039` | Neanderthals, Denisovans and the island species. Here the modern years are largely GENETIC results rather than digs, which is a different thing — the reader needs the interbreeding percentages, not the lab that ran them. |
| **H5** | `wh-060`, `wh-067`, `wh-085`, `wh-094` | Objects and painted caves. Altamira's card is about a 19th-century controversy over authenticity; that is a fine card, but it is a card about archaeology, and the cave's own 22,000 years are barely in it. |
| **H6** | `wh-017`, `wh-065`, `wh-066`, `wh-096` | Named places and industries whose names are 19th- and 20th-century acts. These are the hardest, because the naming genuinely is part of the subject; the target is to keep one sentence of it, not four. |

## What H1 actually shipped, and what it added to the rule

H1 was done as part of a wider pass over **all ten** Ancient Greece cards, not just the two flagged
ones, because the whole deck was written from dig reports and the unflagged eight were the same fault
below the threshold — `gr-004 Keros` was a finds inventory, `gr-003` was carving hours and lost
findspots. Excavation vocabulary across the ten went from 27 mentions to 12, and from 22 to 6 leaving
out `gr-007`, where the dig IS the subject.

Three things came out of it that the rest of the batches should carry:

- **The date line is where a correction goes to die.** `gr-008`'s abstract was rewritten and its
  `First dug 1878, by Minos Kalokairinos` / `Evans dug 1900–1931` rows sat there afterwards; the same
  had happened to `gr-004` and `gr-010`. This is the third time the pass has found a correction that
  travelled through prose and stopped at `answerDate`. **Strip the dig rows in the same commit**, with
  `set-date-line.js`, and check the sort year afterwards — three Greek cards were yielding modern years
  to `cardYears` purely from those rows.
- **The question pool goes with the prose.** Eleven of the thirty Greek phrasings rested on material
  the rewrite removed — Schliemann's failed negotiation, Kalokairinos's twelve store jars, the 1963
  looting. A rewritten card with an unrewritten question pool asks about a background it no longer has.
- **Two corrections and a withdrawal.** `gr-006` said the armed graves near Knossos are "usually read as
  an intrusive Mycenaean military caste" and stopped; the cited page says the newest study argues for
  Minoans of three ranks. `gr-007` claimed Evans proposed "Minoan" to the British Association at
  Cambridge in 1904, which is in none of the works the card cites, and it was withdrawn rather than left
  standing on a source that does not say it. **Re-reading the sources to cut the dig finds errors in
  what stays** — the same thing the citation top-ups found.

A fourth rule came out of the same reading and is now in CLAUDE.md under `abstract`: **a background
covers its whole answer term.** `gr-001` was rewritten history-first and came back seven-tenths about
Crete, because Crete is where the palaces, the writing and the best open sources are; *Aegean Bronze
Age* is three traditions by definition. It was reported by a reader and rebalanced the same day. Expect
this to bite in H3 and H4, where one species or one site is far better published than its siblings.

## Two things the pass must not do

- **Do not delete a hedge to make room.** "Scholars still disagree about…" is not archaeology-talk; it is
  accuracy, and the golden rules require it.
- **Do not invent history to replace excavation history.** If a site's Bronze Age occupation genuinely is
  not documented in anything openable, the card says less rather than more, and the gap is recorded in
  `.claude/sources-register.md` — the same rule the citation pass runs on.
