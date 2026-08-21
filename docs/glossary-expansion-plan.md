# The glossary audit and expansion (Aug 2026, on request)

Three jobs asked for together, and they are kept apart here because they fail differently and
finish at different times.

1. **AUDIT** — every description must be a GENERAL INTRODUCTION to its own term, written for a
   reader who knows nothing about it beforehand. `Tin` was named as the example.
2. **REMOVE** four terms, and correct two auto-linking faults.
3. **ADD** the requested terms. Once the five "add all X" groups are expanded this is about
   **400 terms**, which is the largest single content pass this glossary has had.

---

## 1. The audit

### The rule

**A gloss popup is met cold.** The reader has tapped a word in the middle of somebody else's
sentence and may never have heard of it, so the FIRST sentence has to say what the thing IS —
its class, and what separates it from the other things of that class. Only then may the
remaining two sentences say anything about it.

What this pass hunts is the description that opens on a SPECIFIC CONTEXT, a piece of research,
or one famous example, and never gets round to the definition. `Tin` is the case the request
names:

> Tin travelled a long way to reach the places that used it, and where it came from is one of the
> standing questions of Bronze Age archaeology; earlier attempts to fingerprint the metal all
> failed…

Every word of that is true and none of it says tin is a soft silvery metal that alloys with
copper to make bronze — which is the one thing a reader meeting the word needs. The three
sentences are a research summary standing where a definition should be.

**The corollary is that the SPECIFICS are not the enemy.** A description with no dates, no
figures and no named finds is a worse description, not a safer one — the house rules already
demand a term be impartial, self-contained and cited. What is being corrected is the ORDER and
the PROPORTION: define first, then illustrate, and never let one dig, one wreck or one
laboratory method stand in for the term itself.

### The measure

`node .claude/gloss-general.js [--list] [--tag=<kind>] [--term=<slug>]`

It takes each description's first sentence, asks whether it predicates something of the TERM
ITSELF with a copula or a naming verb, and reports everything else. **It is a prompt to read,
never a verdict** — it cannot tell a good definition from a bad one, and it has false positives
on terms whose subject genuinely opens another way.

Two things about it are worth knowing before touching it.

**IT REUSES `split-abstract.js`'s SPLITTER RATHER THAN CARRYING A SECOND COPY.** Written with a
naive full-stop rule it reported "Jason E." as a whole sentence and flagged fourteen presidents
and palaeoanthropologists for having initials in their names — 46 flagged against a true 20.

**AND ITS VERB LIST MAY CONTAIN NOTHING USABLE AS A NOUN.** It briefly carried `places?`, for
"the technique places the figures…", which matched the NOUN in *"Tin travelled a long way to
reach the **places** that used it"* — silencing the one term the whole audit was written for,
with nothing on the report to show that it had. `set`, `works`, `records`, `leaves`, `stores`,
`marks`, `forms` and `measures` are the same trap. **Prefer reading a false positive to widening
the list.**

### Batches

| batch | scope | state |
|---|---|---|
| **A1** | the terms the measure flags | shipped |
| **A2** | a directed read of the general kinds — `object`, `concept`, `practice`, `animal`, `plant`, `technology`, `industry` — whose subjects are the ones most easily replaced by a case study | open |
| **A3** | sentences 2 and 3 across the corpus: a term that defines well and then spends its remaining two thirds on one site | open |

A2 and A3 cannot be automated the way A1 is. A1 asks whether a sentence has a definition in it,
which is a shape; A2 and A3 ask whether a description is ABOUT its term, which is a judgement.

---

## 2. Removals and corrections

**Removed on request:** `Wheel`, `Burial`, `Village`, `City`.

**`cist` is no longer an alias of `Cist_grave`.** A cist is a stone box, which is a thing in its
own right and turns up in contexts that are not graves; the alias made every one of them link to
a burial type. `cist tomb` and `slab-built cist` stay, both being unambiguous.

**`Shun` is case-sensitive.** Lower-case *shun* is an ordinary English verb, and the alias linked
it to the second Chinese sage-king wherever a card said somebody shunned something. This is the
`Afar` and `Boreal` rule for the third time: **ask of every short key whether it is also an
ordinary English word.**

---

## 3. The additions

### What the "add all X" groups actually cost

| group | terms | note |
|---|---|---|
| Minoan chronology | ~24 | EM/MM/LM, majors and the sub-phases the request names |
| Helladic chronology | ~14 | EH/MH/LH |
| Troy levels | ~11 | Troy I–IX with VIIa / VIIb |
| Hills of Rome | 7 | Palatine named separately in the request |
| **Italian provinces** | **107** | Italy's provinces and metropolitan cities |

So 244 named terms plus ~163 = **about 400**.

**The chronology groups are the ones to get right rather than the ones to get through.** The
request says outright: *ensure it is clear for each what sets them apart from the others.* A
phase description that says only "the second phase of Early Minoan, about 2650–2200 BCE" has
told the reader nothing they could not have guessed from the name. Each needs its own
**diagnostic** — the pottery, the architecture, the burial form or the destruction horizon that
is why the phase was cut where it was.

### The sourcing spine, measured 2026-08-21

Reachable, and what each is for:

| host | for |
|---|---|
| `perseus.tufts.edu` | the ancient authors, in translation and in the original |
| `chs.harvard.edu` | Center for Hellenic Studies monographs, open in full |
| `journals.openedition.org`, `persee.fr` | French archaeology of Greece, Italy and the Aegean |
| `doi.org` | resolves; a paywalled landmark is still citable where it is the landmark |
| `europepmc.org` | the genetics, the isotopes, the palaeoenvironment |
| `istat.it` | **the Italian provinces** — the national statistical office, per province |
| `namuseum.gr` | the National Archaeological Museum's own object records |
| `openarchaeologydata.metajnl.com` | open excavation datasets |

Shut here: `britannica.com` (403, and it fails the cites-its-sources test the plan already
applies), `whc.unesco.org` (403 — reach UNESCO properties through the state party's own record),
`ascsa.edu.gr` (no answer).

### Batches

Grouped so the research is shared — one body of scholarship serves a whole batch.

| batch | terms | subject |
|---|---|---|
| N1 | 6 | Bronze and Iron Age tripartite divisions (Early / Middle / Late, both) |
| N2 | 12 | Minoan chronology I — Early Minoan and Middle Minoan |
| N3 | 12 | Minoan chronology II — Late Minoan, and the Cretan sites of each phase |
| N4 | 14 | Helladic chronology |
| N5 | 11 | Troy levels |
| N6 | 12 | Aegean prehistorians and museums |
| N7 | 12 | Athens topography |
| N8 | 12 | Mycenaean tombs and grave circles |
| N9 | 12 | Greek architecture and its orders |
| N10 | 12 | Greek vessel and object vocabulary |
| N11 | 12 | Greek regions and islands |
| N12 | 12 | Crete: sites and landscape |
| N13 | 12 | Cyprus and the Late Bronze Age east |
| N14 | 12 | Materials, alloys and the sciences that source them |
| N15 | 12 | Rome's foundation and its earliest institutions |
| N16 | 12 | The hills of Rome and the city's topography |
| N17 | 12 | Latium: the Latial culture and its sites |
| N18 | 12 | The Italic peoples — Samnites, Sabines, Umbrians |
| N19 | 12 | Umbria and its sanctuaries |
| N20 | 12 | Italian landscape and geology |
| N21 | 12 | Tanzania, the Serengeti and African mammal groups |
| N22 | 12 | Olduvai beds, palaeoanthropology's institutions |
| N23 | 12 | Amarna and Egypt |
| N24–N32 | ~107 | **the Italian provinces**, by region |

**The provinces are their own phase and should be worked last**, for two reasons: they are a
quarter of the whole pass, and they are the only part of it that is a table rather than a
subject — one authoritative source per term, one shape of sentence, no argument to weigh. Doing
them first would spend the pass's best attention on its least interesting terms.

### The standing rules a new term is held to

Unchanged, and this pass does not relax them:

- **three sentences, 90–110 words** (`gloss-length.js`);
- **at least two citations**, each ending in an openable URL, each pointed at by an empty
  `<sup class="fn">` marker (`add-glossary.js` refuses less);
- **at least three tags**, reusing the established vocabulary;
- **impartial, deck-agnostic and self-contained** — no "unlike X", no framing the term inside one
  collection's story;
- **a picture, or a stated reason there is none**;
- and now, from this pass: **the first sentence defines the term.**

### The alias trap this pass will keep meeting

Half the requested terms are short, and several are ordinary English words or the names of other
things entirely — `honey`, `fig`, `slate`, `lava`, `karst`, `deme`, `Perseus`, `Salamis`,
`Arcadia`, `Berlin`, `Genoa`, `Messina`, `Foglia`, `Maa`, `Kea`, `Bed I`. Three rules, all of
them already recorded here and all of them learned the hard way:

- **ask whether the surface is also an ordinary word** — `Shun`, `Afar`, `Boreal`;
- **ask what a new key will match once the OTHER collections are written**, not only what it
  matches today — `Perseus` is a Greek hero AND a digital library this glossary cites;
- **an alias list written before its sibling term exists will contain that sibling's name** —
  `Arcadia` is requested twice in the same list, once as a Greek region and once as the Arcadian
  homeland of Evander in Rome's foundation legend.
