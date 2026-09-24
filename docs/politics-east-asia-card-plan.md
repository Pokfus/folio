# Politics: East Asia — the card plan

The running order for the **Politics: East Asia** collection (`pea`), card prefix `pea-`, across 24
decks: **Lectures 1–12** and **Extra 1–12**. It is the sibling of the nineteen collection plans, and
it is used the same way — the next card to write is the lowest `pea-NNN` not yet in `data.js`, and its
deck comes from the running order below.

## What this collection is about

It is a **university course**, not one of Folio's own subject shelves, and that is the whole reason it
sits in a **Special** section of the Collections page rather than under History or Science. The
distinction matters editorially as well as visually: a subject shelf is planned from the subject, where
this one is planned from a syllabus somebody else set. A deck is a lecture, and what is in it is what
that lecture covered.

The subject is the **government and politics of China, Japan and the Koreas** — the institutions, the
parties, the electoral systems and the arguments about them — rather than the region's history, which
the China, Japan, Korea and World History collections already carry. Where a card names a historical
event it is because the politics of the present turns on it: Gwangju is here for what it did to Korean
party alignment, not as a card about 1980.

## Why this plan is not a thousand lines

The other plans fix a whole running order in advance, because their subject is known in advance. This
one **cannot be written ahead of the lectures**, whose slides are supplied one at a time — so the
running order below covers exactly the material that has been supplied, and grows a lecture at a time.
Three consequences, each deliberate:

- **The numbering is sequential in the order the lectures are covered**, not blocked out per deck.
  Lecture 1 took `pea-001`–`pea-030`, Lecture 2 `pea-031`–`pea-060`, Lecture 3 `pea-061`–`pea-090` and
  Extra 1 `pea-091`–`pea-100`. A card id is a permanent address, so the blocks are what they are and
  are never renumbered to tidy them.
- **The volume is 30 cards a lecture and 10 for each set reading**, which is what the collection's
  `total` of 480 counts. The 20 decks with no cards in them are coming-soon automatically —
  `isComingSoon` is true for a node holding no card — so nothing has to be un-flagged deck by deck when
  a lecture lands.
- **A deck heading below with no lines under it is a deck waiting for its source material**, and says
  so. It is not a gap to be filled from general reading: the point of the collection is that it covers
  the course as taught.

## Where the content comes from

Each lecture deck is written from that lecture's own slides, and each Extra deck from that week's set
reading. **The answer terms and the load-bearing facts come from the supplied material**; the
backgrounds are then researched out to the house length and cited like any other card, which is where
the scholarship comes in. A card may not assert something the lecture asserts and nothing else does —
if the reading is the only source for a claim, the card says whose claim it is.

`.claude/find-sources.js` is what makes the citation bar affordable here: five citations a card, mostly
open access, over a literature that is largely journal articles rather than books. Query by the
concrete event rather than by the concept — a search for "patriotic education" returns theory, where
one naming the 1994 campaign returns the work on it.

## Two things the first hundred cards settled

- **A date line carries dates, not a fact box.** Fifty-six of these cards first shipped with a date
  line stating seat counts, membership numbers and party heartlands, which is a facts grid wearing a
  date line's clothes — and `test-date-line.js` is what caught the eleven of them that yielded no sort
  year at all. Where an institution has no date worth memorising, the line is **empty**.
- **An answer term may not appear twice in the collection.** The lectures and the readings overlap by
  design, so the same term really can be the right answer in two decks — `pea-099` was written as
  *party-state* when `pea-030` already was. The reading's card takes the nearest thing the reading has
  that the lecture does not, which is how `pea-099` became *advance of the state, retreat of the
  private*.

# The list

## Lecture 1 · The politics of the PRC — `pea-l1`

  pea-001  Tiananmen Massacre
  pea-002  Southern Tour
  pea-003  Collective leadership
  pea-004  Nomenklatura
  pea-005  People's Liberation Army
  pea-006  Xi Jinping
  pea-007  Patriotic Education
  pea-008  Shenzhen
  pea-009  Central Military Commission
  pea-010  Politburo Standing Committee
  pea-011  Anti-corruption campaign
  pea-012  Belt and Road Initiative
  pea-013  National People's Congress
  pea-014  Civilizational state
  pea-015  Zhang Weiwei
  pea-016  Xu Zhangrun
  pea-017  Xi Jinping Thought
  pea-018  Hu Jintao
  pea-019  Harmonious Socialist Society
  pea-020  Soviet collapse
  pea-021  National Party Congress
  pea-022  Central Committee
  pea-023  Paramount Leader
  pea-024  Jiang Zemin
  pea-025  Princelings
  pea-026  Premier
  pea-027  Central Commission for Discipline Inspection
  pea-028  Abolition of term limits
  pea-029  Principal-agent problem
  pea-030  Party-state

## Lecture 2 · The politics of Japan — `pea-l2`

  pea-031  Article 9
  pea-032  1947 Constitution
  pea-033  SCAP
  pea-034  Anpo
  pea-035  Okinawa
  pea-036  Japan Self-Defence Forces
  pea-037  National Diet
  pea-038  Sekihairitsu
  pea-039  Emperor
  pea-040  1955 System
  pea-041  Liberal Democratic Party
  pea-042  Democratic Party of Japan
  pea-043  Iron Triangle
  pea-044  Fukushima disaster
  pea-045  Abenomics
  pea-046  Abe Shinzō
  pea-047  Womenomics
  pea-048  Demographic timebomb
  pea-049  History Issue
  pea-050  Gender Parity Law
  pea-051  Japan Socialist Party
  pea-052  Cabinet
  pea-053  Komeito
  pea-054  Lost Decades
  pea-055  Matahara
  pea-056  Constitutional Democratic Party
  pea-057  Supreme Court
  pea-058  Kishida Fumio
  pea-059  Takaichi Sanae
  pea-060  Koike Yuriko

## Lecture 3 · The politics of South Korea — `pea-l3`

  pea-061  Candlelight Revolution
  pea-062  Chaebol
  pea-063  Gwangju Uprising
  pea-064  Park Chung-hee
  pea-065  Park Chung-hee Syndrome
  pea-066  Chojoongdong
  pea-067  Regionalism
  pea-068  National Security Law
  pea-069  Minjung
  pea-070  Presidency
  pea-071  Constitutional Court
  pea-072  Sunshine Policy
  pea-073  Kim Dae-jung
  pea-074  June Democratic Uprising
  pea-075  Christianity
  pea-076  Martial Law Crisis
  pea-077  Yoon Suk-yeol
  pea-078  Park Geun-hye
  pea-079  Sewol
  pea-080  Choi Soon-sil gate
  pea-081  Moon Jae-in
  pea-082  Roh Moo-hyun
  pea-083  Lee Myung-bak
  pea-084  Lee Jae-myung
  pea-085  National Assembly
  pea-086  People Power Party
  pea-087  Democratic Party of Korea
  pea-088  Miracle on the Han River
  pea-089  Gender conflict
  pea-090  Rhee Syngman

## Lecture 4 — `pea-l4`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 5 — `pea-l5`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 6 — `pea-l6`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 7 — `pea-l7`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 8 — `pea-l8`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 9 — `pea-l9`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 10 — `pea-l10`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 11 — `pea-l11`

*Not yet written — the lecture it covers has not been supplied.*

## Lecture 12 — `pea-l12`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 1 — `pea-e1`

  pea-091  Leninism
  pea-092  Party cells
  pea-093  Hukou
  pea-094  Great Leap Forward
  pea-095  Cultural Revolution
  pea-096  Reform and opening
  pea-097  Three Represents
  pea-098  Red capitalists
  pea-099  Advance of the state, retreat of the private
  pea-100  Reds and experts

## Extra 2 — `pea-e2`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 3 — `pea-e3`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 4 — `pea-e4`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 5 — `pea-e5`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 6 — `pea-e6`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 7 — `pea-e7`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 8 — `pea-e8`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 9 — `pea-e9`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 10 — `pea-e10`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 11 — `pea-e11`

*Not yet written — the lecture it covers has not been supplied.*

## Extra 12 — `pea-e12`

*Not yet written — the lecture it covers has not been supplied.*
