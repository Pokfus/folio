# Ancient Rome — the chronology the collection commits to

The dates, conventions and name spellings the Ancient Rome collection (`col-40`, `rm-001`–`rm-1000`) uses,
in ONE place, so that no two cards disagree about when something happened or how it is spelled. Written in
Oct 2026 as Batch 0 of the refinement audit (`docs/rome-refinement-audit.md`), on the model of
`docs/greece-chronology.md` and `docs/wh-chronology.md`.

**Every date line and every date in a background must agree with this file.** Where a card needs a date
this file does not carry, add the row here in the same commit as the card, with the source it came from.
Where a card's own research shows a row here is wrong, correct the row and grep the collection for the old
figure on the day — a correction does not travel on its own. A row is only ever added from a source a batch
actually read; nothing here is carried over from the bulk-written cards unchecked.

`node .claude/rm-audit.js` reads the `chronology-pins` block at the foot of this file and reports any pinned
card whose date line does not carry its pinned figures.

## Conventions

| case | write | not | why |
|---|---|---|---|
| a year under 1000 | `509 BCE`, `79 CE`, `476 CE` | `509`, `79 AD`, `AD 79` | `cardYears` reads a bare first-millennium number only through the era; the numeral leads |
| a year from 1000 on | `1453`, `1570` | `1453 CE` | no era needed; the house form |
| the era | `BCE` and `CE` | `BC`, `AD`, `B.C.`, `A.D.` | site-wide (`check-style.js` refuses "AD"); a Latin title or a quotation keeps its own form |
| a span across the era | `27 BCE – 14 CE` | `27 – 14 CE`, `27 BC – AD 14` | both halves carry their era, or the first is read as CE |
| an approximate range | `c. 625 – 575 BCE` | `c. 625 – c. 575 BCE` | a `c.` inside a range breaks the era's leftward carry |
| a century | `c. 700 – 600 BCE` | `7th century BCE` on the line | a century alone yields no sort year; in prose "the 7th century BCE" is fine |
| a year counted from the founding | the BCE/CE year on the line; in prose "the year 1000 from the founding, 248 CE" | `AUC 1000` on the line | AUC is the Roman count, not the card's; it is converted on Varro's epoch (`753 BCE` = year 1) and the prose says so where it matters |
| a consular year | the BCE year, with the consuls in prose if the card needs them | "the year of Caesar and Bibulus" as the only date | Rome named its years by the two consuls; the card's date line carries the number a reader can sort |
| a Varronian year in the early Republic | the conventional year, e.g. `509 BCE`, `390 BCE` | a "corrected" year chosen silently | the conventional (Varronian) years before the 3rd century BCE rest on an ancient reconstruction and differ from Livy's and the Greek historians' by a few years; where a source gives the other figure, the prose says whose each is |
| a legendary date | `Traditional` / `By tradition` as the label, e.g. `753 BCE` | `Founded 753 BCE`, `after 753 BCE` | the founding, the regal years and the first consuls are an ancient reckoning, not a record; the label says so, and the prose says whose reckoning (Varro, Livy, Dionysius) |
| an act of a legendary king | no date, or the king's traditional reign | `after 753 BCE` | "after 753 BCE" dates nothing; the sort year it yields puts every regal card at the founding |
| a reign | `Reigned 27 BCE – 14 CE` | `Ruled 41 years` | a count of years is not a date; give the first and last years the sources give |
| an emperor | Born, Reigned, Died (≤ 4 rows) | an accession and a death in prose only | the Greece rule for a historical person |
| a day | `15 March 44 BCE` | `the Ides of March, 44 BC` on the line | the Roman day may be named in prose; the line carries the modern form |
| a day before the Julian reform | the date as the sources give it, in the Roman calendar | a silent conversion to the season | the pre-Julian calendar ran out of step with the sun; the prose says so where the season matters |
| the end of the Republic / the West | the event the card is about (`27 BCE`, `476 CE`) with what it was | one date as if it were the whole process | the endings are conventions; a card says which convention it uses |
| a disputed date | two rows (`Dated` / `Also dated`), or in prose "X puts it…; Y puts it…" | one figure chosen silently | the Greece rule |
| an excavation | a `Found` row only on a site or find card, after the dates of the thing itself | a discovery year as the card's only date | a discovery year sorts the card into the modern period |
| no date a source gives | omit it | an estimate | never estimated |

Questions carry **no dates at all** — no year, century, millennium or decade, and no AUC year
(`rm-audit.js` reports "AUC" in a question as `Q.date`). Period names (the regal period, the Principate,
the Dominate) are fine; a consul's name is not a date and is fine.

## Spellings

Measured over the shipped collection in Oct 2026; the house form is the one the collection already uses
most, which is the familiar English form for the famous and the Latin form for everyone else.

| use | not |
|---|---|
| Mark Antony (Antony after the first mention) | Marcus Antonius, except inside a citation or a Latin phrase |
| Pompey | Pompeius, except as the family name of his sons and kin where the source uses it |
| Octavian (before 27 BCE), Augustus (from 27 BCE) | Octavianus |
| Caligula (first mention), Gaius | — both are used; the first mention says who is meant |
| Livy, Virgil, Horace, Ovid | Titus Livius, Vergil, Horatius (the poet) |
| Tarquinius Superbus, Servius Tullius, Numa | Tarquin the Proud; Numa Pompilius after the first mention |
| Sulla, Mithridates, Boudica | Sylla, Mithradates, Boudicca, Boadicea |
| Carthaginian (the people and state), Punic (the wars and the language) | |
| Etruscan | Tyrrhenian, except inside a quotation of a Greek source |
| plebeians (the order), the plebs (the people) | |

## The regal period and the early Republic

Filled batch by batch, from the source each row names. The legendary dates are given AS tradition.

| event | the collection says | source |
|---|---|---|

## The middle and late Republic

| event | the collection says | source |
|---|---|---|

## The Principate

| event | the collection says | source |
|---|---|---|

## Late Antiquity

| event | the collection says | source |
|---|---|---|

## Chronology pins

The figures each refined card's date line must carry. One line per card, `rm-NNN: figure; figure`. Only a
figure that is on the date line is pinned.

```chronology-pins
```
