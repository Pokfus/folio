# Gateway to Global Affairs — the card plan

The running order for the **Gateway to Global Affairs** collection (`gga`), card prefix `gga-`, across
**21 decks**: **Lectures 1–7** and **Readings 1–14**. It is the sibling of the Politics: East Asia
plan (`docs/politics-east-asia-card-plan.md`) and is used the same way — the next card to write is the
lowest `gga-NNN` not yet in `data.js`, and its deck comes from the running order below. **Read that
plan's "What this collection is about" first if this is the first course plan you have met**; the
reasoning is not repeated here.

**State: WIRED, cards in progress.** The collection is in `COLLECTION_TREE`, `app.js` (the Special section
and its colour) and `test-card-plans.js`; the cards are written deck by deck and `node .claude/next-cards.js gga- 10`
lists the next ten. A deck with no cards in it is coming-soon, so nothing is un-flagged as a lecture lands.

## What this collection is about

It is a **university course**, not one of Folio's own subject shelves — **Gateway to Global Affairs
(GGA)**, taught at Leiden University by Prof. Bert Koenders (a former Dutch Minister of Foreign
Affairs, whose own practice the slides draw on) with a guest speaker most weeks. Like Politics: East
Asia it sits in the **Special** section of the Collections page, and for the same reason: it is planned
from a syllabus somebody else set. **A deck is a lecture or a set reading, and what is in it is what
that lecture or reading covered.**

The subject is **how the world is run, contested and bargained over now**: who holds power, in which
arenas it is used (armies, money, chips, ports, shipping lanes, data), how multilateral institutions
and the law are holding up, how development, aid and peacekeeping work and fail, and how wars end. The
course's own lens is on its first slide — **power centres, arenas where power is exercised, worldviews,
and personalities**, set against the triangle of **security, prosperity and (liberal-democratic)
values** — and the plan keeps to it.

## Where the content comes from

Each lecture deck is written from that lecture's slides, each reading deck from that reading.

**TWO MODES, by card number (Oct 2026, on the owner's instruction).** `gga-001`–`gga-056` were researched out
to the house length and cited to outside scholarship. **From `gga-057` on, the cards are written from the
course's own slides and readings ONLY**, because the collection is a private study deck and the course
material is the accuracy the owner needs. Those cards (and any later replacement of an earlier line) are held to
a **bar of 2 sources** (`SRC_TARGET_BY_PREFIX` in `app.js`, read by `.claude/src-target.js`), every source is a
course text cited at a distinct slide or page and ending ` [Course material]` (the one citation form `add-card.js`
lets off the link rule), and 2026 events may be written as the text reports them. The rules below still hold.

**The answer terms and the load-bearing facts come from the supplied material.** Four rules, all inherited:

- **A card may not assert something the lecture or reading asserts and nothing else does.** If the
  source is the only authority for a claim, the card says whose claim it is. That matters more here
  than in a history collection: **the material runs to October 2026, past what any reference work
  yet holds** (the Iran war and the closure of the Strait of Hormuz, the 2026 NATO summit, the
  Trump–Xi trade truce, the AIV's 2 July 2026 advice on Ukraine). Those cards cite the supplied
  article and a dated news or primary source, and say "according to" where only one exists.
- **An answer term may not appear twice in the collection.** The lectures and the readings overlap by
  design — Rodrik, Farrell and Newman, the Hormuz shock and Mali each arrive from three directions —
  so the term goes to ONE deck (the one whose source defines it) and the others take the nearest
  thing they have that the first does not. This plan has been checked for it.
- **A line is a subject to research, not a fact and not always the finished answer term** — the
  card's blanked word is chosen while writing it. Where research says a line is wrong, change the
  line in the same commit as the card.
- **Guest speakers are not carded as people.** A guest's slides are carded for what they say
  (Bomberger's missing-persons deck is in Lecture 3), not for who the guest is.

## Source status — what was actually in hand when this was planned

**Every line below was drawn from text that was read**, from the lecture slides and from the readings as
they were supplied in three pastes and two further PDFs. Where a source is still incomplete the deck is
smaller than the source deserves, and that is the only compromise: nothing is planned from pages that were
not supplied. *The Lecture 1 draft deck was struck at the owner's request and nothing in the plan comes from it.*
All the lecture decks are this year's, and **the order the lectures are numbered in does not matter**: a deck
is named for what its slides cover.

| Source | State | Deck |
|---|---|---|
| Lecture 1 — *Diplomacy in Practice* | full text; slides 24–26 (images) and the videos not read | `gga-l1` |
| Lecture 2 — *The Military Political Nexus* | full text; maps and videos not read | `gga-l2` |
| Lecture 3 — *Economic Diplomacy, Humanitarian Aid and Development* (with K. Bomberger, ICMP) | full text; some images not read | `gga-l3` |
| Lecture 4 — *The Global South and Multilateralism* | full text | `gga-l4` |
| Lecture 5 — *Ukraine: Making Peace with a Revisionist Power* (with Amb. H. Schuwer) | full text; slides 27–36 are blank in the file | `gga-l5` |
| Lecture 6 — *The International Legal Order* (Dr E. Dijxhoorn) | text and charts read | `gga-l6` |
| Lecture 7 — Russia | **not supplied** | `gga-l7` |
| R1 Leonard, "The Abandoned Order" (*Foreign Affairs*, Sep/Oct 2026) | complete | `gga-r1` |
| R2 Leahy, "China warns US it could retaliate over Iran sanctions" (*FT*, 25 Aug 2026) | complete | `gga-r2` |
| R3 De Lauri, "Humanitarian Diplomacy: A New Research Agenda" (CMI Brief 2018:4) | complete, with its research questions | `gga-r3` |
| R4 Lindborg & Hewitt, "In Defense of Ambition" (*Dædalus*, Winter 2018) | complete, pp. 158–170 | `gga-r4` |
| R5 Farrell & Newman, "The Weaponized World Economy" (*Foreign Affairs*, Sep/Oct 2025) | **partial** — the opening, the Europe passage and the last third; the middle is missing. The Lecture 4 slides that summarise the article stand in for part of it | `gga-r5` |
| R6 "The tricky restructuring of global supply chains" (*The Economist*, 16 Jun 2022) | complete | `gga-r6` |
| R7 Oks & Williams, "The Long, Slow Death of Global Development" (*American Affairs*, Winter 2022) | complete (web text, with footnotes) | `gga-r7` |
| R8 Collier & Duponchel, "The Economic Legacy of Civil War" (*J. Conflict Resolution*, 2013) | **partial** — pp. 82–88 of 65–88 (last tables, conclusion, notes); the 2010 UNU-WIDER working paper of the same study (WP 2010/90) fills in the theory and data | `gga-r8` |
| R9 Rodrik, "Globalization's Wrong Turn" (*Foreign Affairs*, Jul/Aug 2019) | **partial** — pp. 26–27 of 26–33 | `gga-r9` |
| R10 FMO, "Investing in Fragile and Conflict-Affected States" | complete | `gga-r10` |
| R11 Winer, "From Hormuz to the Sahel: A Fertilizer Shock, and a Maghreb Solution" (MEI, 4 May 2026) | **partial** — the first ≈3 of 7 pp. | `gga-r11` |
| R12 "Can the AI arms race be stopped?" (*The Economist*, 17 Sep 2026) | **partial** — the opening paragraphs | `gga-r12` |
| R13 Staeger, "Resource mobilization in security partnerships" (*Cooperation and Conflict*, 2023) | complete, pp. 502–521 | `gga-r13` |
| R14 Lavenex & Schimmelfennig, "EU rules beyond EU borders" (*J. European Public Policy*, 2009) | complete, pp. 791–812 | `gga-r14` |

**Still missing, and ignored until it arrives:** the middle of R5; pp. 65–81 of R8; pp. 28–33 of R9;
pp. 4–7 of R11; the rest of R12. Do not write a card about any of it from general knowledge. When the pages
come, add the lines **after the deck's last number is used up** — a deck that grows takes the next free
numbers at the end of the collection, never renumbering (the same rule that puts Lecture 7 at `gga-301`).

## The shape

| Deck | id | Cards | Numbers |
|---|---|---|---|
| Lecture 1 · Power centres and the new disorder | `gga-l1` | 24 | 001–024 |
| Lecture 2 · The military–political nexus | `gga-l2` | 32 | 025–056 |
| Lecture 3 · Economic diplomacy, humanitarian aid and development | `gga-l3` | 27 | 057–083 |
| Lecture 4 · Multilateralism and the Global South | `gga-l4` | 21 | 084–104 |
| Lecture 5 · Ukraine and the European security (dis)order | `gga-l5` | 26 | 105–130 |
| Lecture 6 · The international legal order | `gga-l6` | 19 | 131–149 |
| Lecture 7 · Russia | `gga-l7` | — | *awaiting slides* |
| Reading 1 · The Abandoned Order (Leonard) | `gga-r1` | 18 | 150–167 |
| Reading 2 · China, Iran sanctions and retaliation (FT) | `gga-r2` | 6 | 168–173 |
| Reading 3 · Humanitarian Diplomacy (De Lauri) | `gga-r3` | 11 | 174–184 |
| Reading 4 · In Defense of Ambition (Lindborg & Hewitt) | `gga-r4` | 14 | 185–198 |
| Reading 5 · The Weaponized World Economy (Farrell & Newman) | `gga-r5` | 11 | 199–209 |
| Reading 6 · Restructuring global supply chains (The Economist) | `gga-r6` | 9 | 210–218 |
| Reading 7 · The Long, Slow Death of Global Development (Oks & Williams) | `gga-r7` | 23 | 219–241 |
| Reading 8 · The Economic Legacy of Civil War (Collier & Duponchel) | `gga-r8` | 9 | 242–250 |
| Reading 9 · Globalization's Wrong Turn (Rodrik) | `gga-r9` | 8 | 251–258 |
| Reading 10 · Investing in Fragile and Conflict-Affected States (FMO) | `gga-r10` | 8 | 259–266 |
| Reading 11 · From Hormuz to the Sahel (Winer) | `gga-r11` | 8 | 267–274 |
| Reading 12 · Can the AI arms race be stopped? (The Economist) | `gga-r12` | 6 | 275–280 |
| Reading 13 · EU–AU security partnership (Staeger) | `gga-r13` | 10 | 281–290 |
| Reading 14 · EU rules beyond EU borders (Lavenex & Schimmelfennig) | `gga-r14` | 10 | 291–300 |
| **Total** | | **300** | 001–300 |

**149 lecture cards and 151 reading cards.** The numbering runs lectures first, then readings, and
**Lecture 7 will take `gga-301` onward when its slides land** — a card id is a permanent address, so the
blocks above are never renumbered to make room. The readings are in the order they appear on the course's
Brightspace page, with the two supplied for Lecture 6 last. **The budget follows the material:** a lecture or
reading is carded in proportion to what it holds, so Oks & Williams (about 11,700 words) has 23 cards and
the Financial Times piece (about 600) has 6.

## Open questions for the owner (none blocks writing)

1. **The Lecture 6 slides cite a longer reading list** (Shaw, Farer, Putin's 2014 and 2022 addresses, Chatham
   House, a run of 2022–2025 opinion pieces). Only the two articles the owner supplied for that lecture
   (Readings 13 and 14) are carded. Say so if any of the rest is examinable.
2. **The remainder of the five partial readings** (see "Still missing"), if it can be had — each would add
   cards to its deck.

# The list

After the dash: what the line is about, then the **locator** in parentheses. For a lecture, `s16` is slide 16
of the deck named in the deck's source line and `L3 s9` points into another deck; for a reading it is a
section head, a page or a paragraph. **Every slide locator was checked by script against the slide text.**
A note is a pointer to the source, not an answer.

## Lecture 1 · Power centres and the new disorder — `gga-l1`

Source: Lecture 1 (*Diplomacy in Practice*), the framework and the vignettes. Slide 14 summarises the Leonard article, which is carded in Reading 1. Slides 24–26 (*Narratives*, from the European Council on Foreign Relations) are images and were not available.

  gga-001  Security, prosperity and values — the policy-goal triangle, as the lecture words it in Dutch · (s15,30)
  gga-002  Polarity — the first lens · (s16)
  gga-003  Structural power — the second lens · (s21)
  gga-004  Operational code — the third lens · (s27)
  gga-005  Leader personality — the "plus one" lens · (s30)
  gga-006  Interregnum — Gramsci: the old is dying and the new cannot be born · (s13)
  gga-007  Crisis of authority — the old order can no longer lead through consent · (s13)
  gga-008  Post-unipolar world — (s16)
  gga-009  Five superpowers — the US, China, India, Russia and the EU · (s16)
  gga-010  Multi-alignment — "the à-la-carte world" · (s16)
  gga-011  Shanghai Cooperation Organisation — founded 2001; enlarged 2017, 2023, 2024 · (s17)
  gga-012  Cold War mentality — Xi at the 2025 SCO summit · (s17)
  gga-013  Demographic transition — reworded from "Europe's shrinking share of the world population": Europe went first, other regions later and faster · (s18)
  gga-014  Convergence clubs — reworded from "Catching up and falling behind": GDP per capita against the Netherlands, 1990 and 2023 · (s19)
  gga-015  South–South trade — reworded from "Asia displaces Europe as trading partner": the Global South's shifting main partners, 1995 against 2022 · (s20)
  gga-016  Weaponisation of everything — (s21)
  gga-017  Mutually assured economic pain — the April–May 2025 US–China tariff climb-down · (s22)
  gga-018  GPS spoofing — jamming and spoofing, EU alarm of June 2025 · (s23)
  gga-019  Revisionist powers — Russia, China, Turkey, Iran · (s27)
  gga-020  Anti-colonialism — (s27)
  gga-021  Comfort Ero — "What Malians mean when they talk of sovereignty" · (s28,29)
  gga-022  Ibrahim Traoré — "no country has developed under democracy" · (s29)
  gga-023  Two-level game — domestic pressure groups and the international table · (s39,41)
  gga-024  Pedro Sánchez — and the 5 per cent target: NATO summit 2025 · (s41)

## Lecture 2 · The military–political nexus — `gga-l2`

Source: Lecture 2. **The Lecture 3 deck repeats the Mali and peacekeeping slides; every one of them is filed here, once** (locators marked L3 point into that deck). Slides 12–15 (maps, Mali's coup, Wagner's presence) are images.

  gga-025  Hybrid warfare — Kilcullen's account · (s6)
  gga-026  Explosion of connectivity — iPad firing tables in Ukraine · (s6)
  gga-027  States acting like nonstate actors — (s6)
  gga-028  Mutually hurting stalemate — (s6)
  gga-029  Drone warfare — Ukraine–Russia · (s7)
  gga-030  Traditional peacekeeping — separation, ceasefire monitoring, buffer zones · (s8)
  gga-031  Holy trinity of peacekeeping — consent, impartiality, non-use of force · (s8; L3 s9)
  gga-032  United Nations Truce Supervision Organization — 1948 · (L3 s10)
  gga-033  Multinational Force and Observers — protocol 1981, mission from 1982 (the slide says 1983) · (L3 s10)
  gga-034  Generations of peacekeeping — first to fifth · (L3 s11)
  gga-035  Stabilisation missions — the fifth generation · (L3 s11)
  gga-036  Resolution 2085 — 20 December 2012 · (s9)
  gga-037  MINUSMA — (s9,10)
  gga-038  Algiers Agreement — 2015 · (s9)
  gga-039  Africa Corps — the rebranded Wagner Group · (s16)
  gga-040  Assimi Goïta — (s11)
  gga-041  Operation Barkhane — (s29)
  gga-042  Penholder — (s18)
  gga-043  Christmas tree mandates — (s29)
  gga-044  UNPROFOR, UNOSOM and UNAMIR — the "fatal trilogy" of the slide; no source uses that phrase · (s20)
  gga-045  Independent Inquiry into the Rwanda genocide — (s21)
  gga-046  Blair Doctrine — Chicago, April 1999 · (s22)
  gga-047  Responsibility to Protect — the three pillars · (s23)
  gga-048  Brahimi Report — 2000 · (s24)
  gga-049  High-level Independent Panel on Peace Operations — HIPPO · (s27,28)
  gga-050  Four essential shifts — primacy of politics, responsive operations, stronger partnerships, field focus · (s26)
  gga-051  No peace to keep — the phrase HIPPO and SIPRI use; slide 28 asks whether peacekeepers should deploy where there is none · (s28)
  gga-052  Protection of civilians — (s25)
  gga-053  Exit strategy — (s31)
  gga-054  Jean-Marie Guéhenno — international organisations reflect the power dynamics of their members · (s32)
  gga-055  Strategic retrenchment — (s36)
  gga-056  Commodified peace — mediation as an arena for entrepreneurs (Kushner) · (L3 s14)

## Lecture 3 · Economic diplomacy, humanitarian aid and development — `gga-l3`

Source: Lecture 3, including Kathryne Bomberger's guest lecture for the International Commission on Missing Persons (ICMP). **The Rodrik-trilemma and WTO slides also appear in the Lecture 4 deck; the trilemma is filed here and the WTO in Lecture 4.** Slide 28 says what to read for this class: Rodrik and Farrell & Newman.

  gga-057  Wandel durch Annäherung — interdependence as peace · (s23)
  gga-058  Dollar clearing system — sanctions on Iran and Afghanistan · (s23)
  gga-059  SWIFT — (s23)
  gga-060  ASML — (s23)
  gga-061  Rodrik's trilemma — hyper-globalisation, national sovereignty, democracy: choose two · (s24,25)
  gga-062  America First — national sovereignty and democracy; limits on globalisation · (s25)
  gga-063  Washington Consensus — national sovereignty and globalisation; limits on democracy · (s25)
  gga-064  Ever closer European Union — globalisation and democracy; limits on national sovereignty · (s25)
  gga-065  Policy space — the African objection in the EPA talks · (s24)
  gga-066  Economic Partnership Agreements — (s24)
  gga-067  Race to the bottom — why markets want rules at the global level · (s24)
  gga-068  Paris Agreement — sovereignty kept, enforceability lost; the NDCs · (s26)
  gga-069  Hormuz–Sahel transmission — the assignment question and its model answer · (s16,17)
  gga-070  Fiscal feedback loop — economic insecurity feeding political instability · (s17)
  gga-071  Multilateral shock response — IMF, World Bank, African Union, conflict prevention · (s17)
  gga-072  International Commission on Missing Persons — ICMP, The Hague · (s44)
  gga-073  Enforced disappearance — (s32)
  gga-074  International Convention for the Protection of All Persons from Enforced Disappearance — (s36)
  gga-075  Right to the truth — (s40)
  gga-076  Srebrenica — the 8,000 and the DNA identifications · (s50)
  gga-077  DNA identification of the missing — (s50)
  gga-078  Missing Persons Group — the regional body of the Western Balkans · (s50)
  gga-079  Syria's missing — almost 300,000 · (s53)
  gga-080  Online Inquiry Center — anonymous reports of mass graves · (s56)
  gga-081  State responsibility to investigate — (s39)
  gga-082  Political will — (s38,41)
  gga-083  Ukraine's missing persons — ~100,000 and growing · (s64,65)

## Lecture 4 · Multilateralism and the Global South — `gga-l4`

Source: Lecture 4 (*The Global South and Multilateralism*). The guest speaker, Fatima Denton, appears only as a biography slide. Slides 16–19 summarise Farrell & Newman and are carded in Reading 5.

  gga-084  Economic diplomacy — Barston's definition · (s4)
  gga-085  The 0.7 per cent aid target — Dutch Directorate-General for Development Cooperation · (s4)
  gga-086  Aid conditionality — development cooperation used to sanction behaviour · (s5)
  gga-087  Sri Lanka's Chinese debt — (s5)
  gga-088  Interconnected but fragmented — the paradox of the deck's opening slide · (s12)
  gga-089  Most armed conflicts since 1946 — 2025 · (s12)
  gga-090  Partners for Multilateralism — Lula, Costa, Ruto, Carney · (s12)
  gga-091  Core Charter principles — sovereignty, territorial integrity, human rights · (s12)
  gga-092  Multilateralism as power politics — "by other means" (Lecture 1, slide 11) · (L1 s11)
  gga-093  World Trade Organization — 1995, successor to the GATT of 1947 · (s14)
  gga-094  Most-favoured-nation principle — (s14)
  gga-095  Doha Round — (s14)
  gga-096  Appellate Body — paralysed since 2019 · (s13)
  gga-097  Plurilateral agreements — (s13)
  gga-098  Ngozi Okonjo-Iweala — WTO Director-General, September 2025 · (s13)
  gga-099  Stable core within an unstable equilibrium — (s14)
  gga-100  Liberation Day — April 2025 · (s14)
  gga-101  Over-dependence — on the US for demand, on China for supply · (s13)
  gga-102  Two-tier world — the race for key technologies · (s19)
  gga-103  Standard-setting power — (s19)
  gga-104  Dependence and autarky — the balance on semiconductors · (s19)

## Lecture 5 · Ukraine and the European security (dis)order — `gga-l5`

Source: Lecture 5 (*Ukraine: Making Peace with a Revisionist Power*; the timetable calls it NATO). Slides 27–36 are blank in the file; slide 25 is the cover of the AIV's *European guarantees for Ukraine's security* (2 July 2026) and nothing more of it was supplied. **Mutually hurting stalemate is in Lecture 2; this deck takes the rest of Zartman's apparatus.**

  gga-105  Ripeness — Zartman, 2001 · (s9)
  gga-106  The precipice — a ripe moment arrives when catastrophe is foreseen · (s12)
  gga-107  Incomplete mutually hurting stalemate — Ukraine · (s12)
  gga-108  Limiting choices — Bosnia 1995 and the 1973 war · (s10)
  gga-109  South Africa's preventative peace — 1990–94 · (s10,11)
  gga-110  Helsinki Final Act — 1975 · (s6)
  gga-111  Deterrence and dialogue — "can these go together?" · (s7)
  gga-112  War guilt and reparations — Versailles · (s6)
  gga-113  A Europe whole and free — (s16)
  gga-114  Bush's "one inch" promise — what was promised to Gorbachev · (s16)
  gga-115  Partnership for Peace — 1994 · (s17)
  gga-116  NATO–Russia Permanent Joint Council — (s17)
  gga-117  Kosovo — Putin's touchstone · (s17)
  gga-118  Munich Security Conference, 2007 — (s15,18)
  gga-119  Bucharest summit, 2008 — no MAP, but they shall become members · (s18)
  gga-120  Destructive ambiguity — (s18)
  gga-121  Minsk agreements — (s19)
  gga-122  Nord Stream 2 — (s19)
  gga-123  Appeasement or gaining time — (s19)
  gga-124  War is normalcy — Bertram against Mearsheimer · (s19)
  gga-125  Absolute victory — RAND, *Avoiding a Long War* · (s22)
  gga-126  Armistice agreement — (s22)
  gga-127  Political settlement — (s22)
  gga-128  Finlandisation — (s23)
  gga-129  Dirty deal — Deen and De Baedts, 2025 · (s23)
  gga-130  Energy ceasefire — the "diplomatic update" slide · (s24)

## Lecture 6 · The international legal order — `gga-l6`

Source: Lecture 6, the guest lecture by Dr Ernst Dijxhoorn (locators are the footer numbers on the slides). Its opening slides (3–8) are Our World in Data charts — child mortality, extreme poverty, nuclear stockpiles, battle deaths, conflict death rates — the lecture's own answer to "are the wars in Ukraine and the Middle East the final nails in the coffin of the rules-based order?" The reading list on its slides is **not** carded; the two readings supplied for this lecture are Readings 13 and 14.

  gga-131  Horizontal legal order — international law as law · (s16)
  gga-132  Sovereignty — Oppenheim's "most controversial" concept · (s17)
  gga-133  Territorial integrity and non-interference — (s17)
  gga-134  De iure belli ac pacis — Grotius · (s18)
  gga-135  The Anarchical Society — Bull's "order among states" · (s15)
  gga-136  Charter of the United Nations — founding text, shown on an image slide · (slide 19)
  gga-137  Rule of law — the UN's definition · (s36,37)
  gga-138  Rules-based international order — the lecture's opening question · (s2)
  gga-139  Legitimacy, equity and self-confidence — the three challenges · (s30)
  gga-140  Putin's Article 51 claim — the address of 24 February 2022 · (s31)
  gga-141  Double standards — Richard Gowan, NRC 2024 · (s34)
  gga-142  2025 Strategic Foresight Report — European Commission · (s38)
  gga-143  International law is politics, but not just politics — but not just politics · (s26)
  gga-144  International Law: 100 Ways It Shapes Our Lives — ASIL, 2018 · (s27)
  gga-145  South China Sea arbitration — link-only slide · (s39)
  gga-146  Arctic Sunrise — link-only slide · (s39)
  gga-147  Bolton and the International Criminal Court — link-only slide · (s39)
  gga-148  States behave as if bound — (s29)
  gga-149  Death rate in armed conflicts — Our World in Data chart · (slide 8)

## Lecture 7 · Russia — `gga-l7`

*Not yet written — the lecture it covers has not been supplied.*

## Reading 1 · The Abandoned Order (Leonard) — `gga-r1`

Mark Leonard, *Foreign Affairs*, Sep/Oct 2026. Complete. Locators are the article's section heads.

  gga-150  Rotten-tail world — *lanwei lou* · (opening)
  gga-151  Un-order — against disorder · (Reality Check)
  gga-152  Kissinger's two pillars — balance of power and agreed rules · (Reality Check)
  gga-153  Fragmentation, contagion and strangulation — (A World in Pieces)
  gga-154  Epistemic fragmentation — (A World in Pieces)
  gga-155  Pax Silica — (A World in Pieces)
  gga-156  Disinhibition — (Out of Control)
  gga-157  Chokepoints as a marker of power — beside GDP and army size · (The Big Squeeze)
  gga-158  Foreign direct product rule — China, late 2025 · (The Big Squeeze)
  gga-159  The 2010 rare-earth cut-off to Japan — (The Big Squeeze)
  gga-160  Russian reserves freeze — 2022 · (The Big Squeeze)
  gga-161  Strait of Hormuz — (Reality Check; The Big Squeeze)
  gga-162  Architects and artisans — (Get Real)
  gga-163  Artisan state — China as the example · (Get Real)
  gga-164  Lobito Corridor — (Get Real)
  gga-165  Frugal ways of war — (Get Real)
  gga-166  Technological sovereignty — (Get Real)
  gga-167  Carbon Border Adjustment Mechanism — (A World in Pieces)

## Reading 2 · China, Iran sanctions and retaliation (FT) — `gga-r2`

Joe Leahy, *Financial Times*, 25 August 2026. Complete. Paragraphs are counted from the first ("Beijing has warned…").

  gga-168  Secondary sanctions — (whole piece)
  gga-169  Teapot refiners — (paras 8–9)
  gga-170  China's anti-sanctions regime — (para 10)
  gga-171  One-year trade truce — Trump and Xi · (paras 3–4)
  gga-172  90 per cent of Iran's oil — (para 3)
  gga-173  Illicit unilateral sanctions — the Chinese foreign ministry's position · (para 6)

## Reading 3 · Humanitarian Diplomacy (De Lauri) — `gga-r3`

Antonio De Lauri, CMI Brief 2018:4. Complete (4 pp.); locators are its headings.

  gga-174  Humanitarian diplomacy — the early-2000s concept · (opening)
  gga-175  Compromise against principle — the tension inside "humanitarian diplomacy" · (Humanitarian diplomacy – an oxymoron?)
  gga-176  Humanitarian principles — humanity, neutrality, impartiality, independence · (Humanitarian diplomacy – an oxymoron?)
  gga-177  Politicisation of access to aid — (The politicization of access to aid)
  gga-178  Safe havens — Bosnia to Syria · (The politicization of access to aid)
  gga-179  Turkey's humanitarian diplomacy — Somalia, then Syria · (Case studies)
  gga-180  The non-stop mediator — Qatar · (Case studies)
  gga-181  International Humanitarian City — Dubai · (Case studies)
  gga-182  UAE Soft Power Strategy — September 2017 · (Case studies)
  gga-183  Leave no one behind — the 2030 Agenda · (opening; New research)
  gga-184  Means and ends — unsavoury actors and compromised neutrality · (New research)

## Reading 4 · In Defense of Ambition (Lindborg & Hewitt) — `gga-r4`

Nancy E. Lindborg and J. Joseph Hewitt, *Dædalus* 147 (1), Winter 2018, pp. 158–170. Complete (pp. 158–160 from the first paste, the rest from the second). Locators are the essay's page numbers or its run-in heads. **The essay dates the first Global Humanitarian Summit to "May 2015"; check it before a card says so.**

  gga-185  State fragility — the absence or breakdown of the social contract · (pp. 158–160)
  gga-186  Legitimacy and effectiveness — the two sources of fragility · (p. 159)
  gga-187  The fifty most fragile states — 43 per cent of the world's most impoverished · (p. 160)
  gga-188  Internationalised internal conflicts — 3 per cent then, a third now · (p. 160)
  gga-189  A crisis-driven focus — (A crisis-driven focus)
  gga-190  Stovepiped bureaucracies — diplomacy, development, defence · (Bureaucratic impediments)
  gga-191  Shared consciousness — McChrystal · (Lack of a shared consciousness)
  gga-192  Three lines of effort in Afghanistan — intelligence, military, development · (Lack of a shared consciousness)
  gga-193  Millennium Development Goals — they avoided conflict, inequity and justice · (the development-sector section)
  gga-194  New Deal for Engagement in Fragile States — the g7+; Busan, 2011 · (Fragile states self-identify for the first time)
  gga-195  Sustainable Development Goal 16 — (Sustainable development goals prioritize inclusivity and accountability)
  gga-196  Pathways to Peace — UN–World Bank, October 2017 · (the development-sector section)
  gga-197  Four S approach — strategic, selective, systemic, sustained · (the closing pages)
  gga-198  Plan Colombia — (the closing pages)

## Reading 5 · The Weaponized World Economy (Farrell & Newman) — `gga-r5`

Henry Farrell and Abraham Newman, *Foreign Affairs*, Sep/Oct 2025. **Partial:** the opening, the Europe passage and the last third ("Self-Sabotage", "Time to Rebuild") are in hand; the middle — where the article builds its case and turns to China — is not. The Lecture 4 slides 16–19, which summarise the article, fill part of that gap. Do not write cards about China's side from the article.

  gga-199  Weaponised interdependence — the opening of the age · (opening; L4 s16)
  gga-200  The June 2025 framework deal — chip-design software for rare earths · (opening)
  gga-201  The American stack — (Self-Sabotage)
  gga-202  Technological stack — (L4 s17)
  gga-203  Rare-earth refining — China, 90 per cent · (L4 s17)
  gga-204  TSMC — (L4 s17)
  gga-205  Nvidia — (L4 s17)
  gga-206  Whole-of-nation approach — China's 2013 data-sovereignty turn · (L4 s18)
  gga-207  EuroStack — (L4 s18)
  gga-208  Anti-coercion instrument — "Europe Always Chickens Out" · (the Europe passage)
  gga-209  Institutional decay at OFAC — hiring freezes and lost staff · (Self-Sabotage)

## Reading 6 · Restructuring global supply chains (The Economist) — `gga-r6`

*The Economist*, 16 June 2022. Complete.

  gga-210  Slowbalisation — (paragraph 1)
  gga-211  Efficiency against resilience — the post-1989 lodestar · (paragraph 3)
  gga-212  Change through trade — (paragraph 5)
  gga-213  Precautionary inventories — 6 to 9 per cent of world GDP · (paragraph 6)
  gga-214  Strategic autonomy — (paragraph 7)
  gga-215  Dual sourcing — (paragraph 6)
  gga-216  Vertical integration — Tesla and the car industry · (paragraph 7)
  gga-217  Local reinvestment — 69 per cent of multinational investment · (paragraph 6)
  gga-218  Autocracies' chokepoints — about a tenth of global trade · (The trouble with safe spaces)

## Reading 7 · The Long, Slow Death of Global Development (Oks & Williams) — `gga-r7`

David Oks and Henry Williams, *American Affairs*, Winter 2022. Complete, with its footnotes. Locators are the article's section heads.

  gga-219  No development without industrialisation — "no countries have ever gotten rich without industrialization first" · (The Manufacturing Path)
  gga-220  Unconditional convergence — manufacturing's special properties (Kaldor, Rodrik) · (The Manufacturing Path)
  gga-221  Rostow's take-off — *The Stages of Economic Growth* · (The Manufacturing Path)
  gga-222  Manufacturing employment share — 18–20 per cent · (The Manufacturing Path)
  gga-223  China's share of poverty reduction — 45 per cent at $2.15, 70 per cent at $10 · (Deng's World)
  gga-224  Statistical compensation — East Asia masking the rest · (intro; Deng's World)
  gga-225  The $2.15-a-day line — (intro)
  gga-226  Commodity supercycle — 2000–15 · (Deng's World; Deindustrialization and Deagrarianization)
  gga-227  The golden age of development — 1950–80 · (The Golden Age)
  gga-228  Volcker shock — (After Us, the Deluge)
  gga-229  Década perdida — the two lost decades · (After Us, the Deluge)
  gga-230  Structural adjustment — (After Us, the Deluge)
  gga-231  Government by means of the aid industry — Idrissa · (After Us, the Deluge)
  gga-232  Premature deindustrialisation — Rodrik · (Deindustrialization and Deagrarianization)
  gga-233  Deagrarianisation — (Deindustrialization and Deagrarianization)
  gga-234  Decomplexification — Brazil's economic-complexity rank · (Deindustrialization and Deagrarianization)
  gga-235  Reprimarisation — (Deindustrialization and Deagrarianization)
  gga-236  Hayateen — "the men who lean against walls" · (Underemployed Masses)
  gga-237  Remittances as lifelines — El Salvador, Kerala · (Jobber, Migrant, Soldier)
  gga-238  Flying geese — (Better Late Than Never?)
  gga-239  Middle-income trap — (Better Late Than Never?)
  gga-240  Farmer–herder conflict — the Sahel and Nigeria · (Our Shrinking World)
  gga-241  The problem of the border line — Du Bois turned over · (Facing the Crisis)

## Reading 8 · The Economic Legacy of Civil War (Collier & Duponchel) — `gga-r8`

Paul Collier and Marguerite Duponchel, *Journal of Conflict Resolution* 57 (1), 2013, pp. 65–88. **Partial:** pp. 82–88 (the last tables, the conclusion, notes) are in hand, and the 2010 UNU-WIDER working paper of the same study (WP 2010/90) fills in the theory and data; the 2013 introduction and results (pp. 65–81) are not. Where the two differ, the 2013 text rules.

  gga-242  Forgetting by not doing — skills atrophy through neglect · (conclusion (2013); WP §1–2)
  gga-243  Technical regress — how violence cuts production · (WP §1)
  gga-244  Sierra Leone's civil war — 1991–2002 · (WP §1, §3)
  gga-245  Revolutionary United Front — (WP §1)
  gga-246  Sierra Leone Employers Survey — five districts, 2006 · (notes (2013); WP §4)
  gga-247  Geographic variation in conflict intensity — the identification strategy · (WP §1)
  gga-248  A lower bound — why the estimates understate the damage · (WP §1)
  gga-249  Willingness to pay for training — the measure of skill scarcity · (Table 4; conclusion (2013))
  gga-250  Diaspora knowledge transfer — the remedy proposed · (conclusion (2013))

## Reading 9 · Globalization's Wrong Turn (Rodrik) — `gga-r9`

Dani Rodrik, *Foreign Affairs*, Jul/Aug 2019, pp. 26–33. **Partial:** pp. 26–27 only (the argument, up to "The Golden Straitjacket"). The trilemma is carded in Lecture 3. Cards about the rest of the article (the Bretton Woods compromise in detail, the remedy) wait for pp. 28–33.

  gga-251  Hyperglobalisation — (p. 26)
  gga-252  Gold standard — (p. 27)
  gga-253  Bretton Woods — (p. 27)
  gga-254  The golden straitjacket — (p. 27 (heading))
  gga-255  Beyond tariffs — the WTO reaches into domestic policy · (p. 26)
  gga-256  Liberalised capital flows — (p. 26)
  gga-257  Globalisation as a force of nature — Clinton and Blair · (p. 27)
  gga-258  Austerity after the crash — (p. 26)

## Reading 10 · Investing in Fragile and Conflict-Affected States (FMO) — `gga-r10`

FMO's summary of the NIRAS and TrustWorks Global study. Complete (3 pp.); locators are its headings. The full report it links to is not in the course material.

  gga-259  Fragile and conflict-affected states — 80 per cent of the extreme poor by 2030 · (opening)
  gga-260  Development finance institutions — (opening)
  gga-261  MASSIF — (opening)
  gga-262  Conflict sensitivity — (Recommendations for DFIs)
  gga-263  Do no harm — (Recommendations for DFIs)
  gga-264  Competing sources of governance — (Recommendations for DFIs)
  gga-265  Humanitarian–development–peace nexus — (Recommendations for DFIs)
  gga-266  Transformative development impact — (Recommendations for DFIs)

## Reading 11 · From Hormuz to the Sahel (Winer) — `gga-r11`

Jonathan M. Winer, Middle East Institute, 4 May 2026. **Partial:** the first three of seven pages (to "The Capacities of the Maghreb and Egypt"); the "Maghreb solution" is not in hand.

  gga-267  Lean season — June–August 2026 · (opening)
  gga-268  Urea price spike — 46 per cent month-on-month · (The Impact of Fertilizer Disruption)
  gga-269  Rain-fed planting window — (The Impact of Fertilizer Disruption)
  gga-270  Liptako-Gourma — (opening)
  gga-271  OCP Group — (The Capacities of the Maghreb and Egypt)
  gga-272  Imported sulfur — (The Capacities of the Maghreb and Egypt)
  gga-273  Algeria's gas-to-nitrogen link — (The Capacities of the Maghreb and Egypt)
  gga-274  Egypt's urea and wheat — (The Capacities of the Maghreb and Egypt)

## Reading 12 · Can the AI arms race be stopped? (The Economist) — `gga-r12`

*The Economist*, 17 September 2026. **Partial:** the opening paragraphs only (about two of nine pages).

  gga-275  Pace the frontier — (paragraph 3)
  gga-276  Alignment — (paragraph 2)
  gga-277  Agents escaping their sandboxes — (paragraph 2)
  gga-278  Misuse by malign actors — Mali, the Houthis · (paragraph 2)
  gga-279  Millennium Prize problem — (paragraph 3)
  gga-280  AI in the destruction of Ukraine — (paragraph 1)

## Reading 13 · EU–AU security partnership (Staeger) — `gga-r13`

Ueli Staeger, "Resource mobilization in security partnerships: Explaining cooperation and coercion in the EU's partnership with the African Union," *Cooperation and Conflict* 58 (4), 2023, pp. 502–521, https://doi.org/10.1177/00108367221147785. Complete (supplied as one of the two Lecture 6 readings; the file was sent twice). Locators are the article's section heads.

  gga-281  Recipient agency — the capacity to act intentionally: a secretariat's agenda and capacity · (A theory of agency outcomes in security partnerships)
  gga-282  Cooperative and coercive interaction modes — how a funder can raise or lower a recipient's agency · (Inter-organizational interaction modes)
  gga-283  Agenda-setting and capacity-building — the two mechanisms of agency change · (Mechanisms of agency change)
  gga-284  The postcolonial paradox — why direct coercion is costly for the EU · (The postcolonial paradox shaping power in the EU–AU security partnership)
  gga-285  African Peace Facility — a purse without power · (Agenda-setting: the EU as a "big payer" but "small player")
  gga-286  Big payer, small player — the EU's "stop being a payer and start being a player" · (introduction; Agenda-setting)
  gga-287  AMISOM troop reimbursements — the EU cap of 2016 as coercive agenda-setting · (EU coercion in the AMISOM troop reimbursement incident)
  gga-288  Pillar Assessment — the EU's financial-management test of the AU Commission · (EU coercion through capacity-building: the Pillar Assessment)
  gga-289  Capacity substitution — help that crowds out the secretariat's own capacity · (Capacity-building: capacity substitution and cushioned conditionality)
  gga-290  Forum-shopping and the European Peace Facility — the EU's way round the AU · (African security beyond the AUC)

## Reading 14 · EU rules beyond EU borders (Lavenex & Schimmelfennig) — `gga-r14`

Sandra Lavenex and Frank Schimmelfennig, "EU rules beyond EU borders: theorizing external governance in European politics," *Journal of European Public Policy* 16 (6), 2009, pp. 791–812, https://doi.org/10.1080/13501760903087696. Complete (the second of the two Lecture 6 readings). Locators are the article's section heads.

  gga-291  External governance — parts of the acquis extended to non-member states · (introduction; Theoretical foundations)
  gga-292  Acquis communautaire — (External governance as an answer to complex interdependence)
  gga-293  Hierarchical governance — the Community method and the quasi-hierarchy of the EEA · (Modes of EU external governance)
  gga-294  Network governance — formal equals, rule expansion by coordination · (Modes of EU external governance)
  gga-295  Market governance — rule expansion by competition; mutual recognition · (Modes of EU external governance)
  gga-296  Rule selection, adoption and application — the three levels of effectiveness · (Effectiveness of EU external governance)
  gga-297  Governance by conditionality — the accession model · (External governance as an answer to complex interdependence)
  gga-298  Governance by externalisation — competition policy reaching Boeing and Microsoft · (External governance as an answer to complex interdependence)
  gga-299  Asymmetric interdependence — what the power-based explanation says hierarchy needs · (Power-based explanation)
  gga-300  European Neighbourhood Policy — external governance short of membership · (introduction; Modes of EU external governance)

# How the collection is wired

Done in the commit that wired it, kept here so the next course collection can copy it:

1. **`COLLECTION_TREE` in `data.js`** (edited as text): a `gga` collection, *Gateway to Global Affairs*, with the
   21 decks above as leaves (`gga-l1`…`gga-l7`, `gga-r1`…`gga-r14`).
2. **`app.js`**: `COLLECTION_SECTION` (`gga` → `Special`), the colour in `COLL_THEME` (olive, measured against
   the other 39 hues on the shelf), and its date in the "new" table.
3. **`.claude/test-card-plans.js`**: `"gateway-to-global-affairs": ["gga", "gga-", [[1, 300]]]`, and a row in
   `CLAUDE.md`'s collection table.
4. **`docs/README.md`** and **`docs/reference.md`**.
5. **A changelog line and a version bump** — the collection reaches readers.

When Lecture 7 lands, add its lines under `## Lecture 7` from `gga-301`, widen the range in
`test-card-plans.js`, and raise the tree's `total`.
