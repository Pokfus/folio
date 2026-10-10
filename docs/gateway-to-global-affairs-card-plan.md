# Gateway to Global Affairs — the card plan

The running order for the **Gateway to Global Affairs** collection (`gga`), card prefix `gga-`, across
**20 decks**: **Lectures 1–7** and **Readings 1–12**. It is the sibling of the Politics: East Asia
plan (`docs/politics-east-asia-card-plan.md`) and is used the same way — the next card to write is the
lowest `gga-NNN` not yet in `data.js`, and its deck comes from the running order below. **Read that
plan's "What this collection is about" first if this is the first course plan you have met**; the
reasoning is not repeated here.

**State: PLANNED, NOT WIRED.** Nothing in this file is in `COLLECTION_TREE`, `app.js` or
`test-card-plans.js` yet, so the collection does not exist on the site and `next-cards.js gga` cannot
find it. "Before the first card" at the foot lists the wiring.

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
**The answer terms and the load-bearing facts come from the supplied material**; the backgrounds are
then researched out to the house length and cited like any other card. Four rules, all inherited:

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

**Every line below was drawn from text that was read.** Where a source arrived incomplete the deck is
smaller than the source deserves, and that is the only compromise: the numbers are fixed, and lines
can be swapped inside a deck when the missing text arrives.

| Source | State | Deck |
|---|---|---|
| Lecture 1 — *Diplomacy in Practice* (final) | full text; image/video slides not read | `gga-l1` |
| Lecture 1 — draft | full text; **superseded**, see "Open questions" | `gga-l1` (†) |
| Lecture 2 — *The Military Political Nexus* | full text; maps and videos not read | `gga-l2` |
| Lecture 3 — *Economic Diplomacy, Humanitarian Aid and Development* (with K. Bomberger, ICMP) | full text; some images not read | `gga-l3` |
| Lecture 4 — *The Global South and Multilateralism* | full text; title slide is dated 2024 | `gga-l4` |
| Lecture 5 — *Ukraine: Making Peace with a Revisionist Power* (with Amb. H. Schuwer) | full text; slides 27–36 are blank in the file | `gga-l5` |
| Lecture 6 — *The International Legal Order* (Dr E. Dijxhoorn) | text and charts read | `gga-l6` |
| Lecture 7 — Russia | **not supplied** | `gga-l7` |
| R1 Leonard, "The Abandoned Order" (*Foreign Affairs*, Sep/Oct 2026) | complete | `gga-r1` |
| R2 Leahy, "China warns US it could retaliate over Iran sanctions" (*FT*, 25 Aug 2026) | complete | `gga-r2` |
| R3 De Lauri, "Humanitarian Diplomacy: A New Research Agenda" (CMI Brief 2018:4) | complete, 4 pp | `gga-r3` |
| R4 Lindborg & Hewitt, "In Defense of Ambition" (*Dædalus*, Winter 2018) | **pp. 158–160 of 158–170 only** | `gga-r4` |
| R5 Farrell & Newman, "The Weaponized World Economy" (*Foreign Affairs*, Sep/Oct 2025) | **opening only (≈1 of 14 pp)**, plus the Lecture 4 slides that summarise it | `gga-r5` |
| R6 "The tricky restructuring of global supply chains" (*The Economist*, 16 Jun 2022) | complete | `gga-r6` |
| R7 Oks & Williams, "The Long, Slow Death of Global Development" (*American Affairs*, Winter 2022) | complete (web text) | `gga-r7` |
| R8 Collier & Duponchel, "The Economic Legacy of Civil War" (*J. Conflict Resolution*, 2013) | **the assigned 2013 text is not in hand**; planned from the 2010 UNU-WIDER working paper of the same study (WP 2010/90), which may differ | `gga-r8` |
| R9 Rodrik, "Globalization's Wrong Turn" (*Foreign Affairs*, Jul/Aug 2019) | **pp. 26–27 of 26–33 only** | `gga-r9` |
| R10 FMO, "Investing in Fragile and Conflict-Affected States" | complete | `gga-r10` |
| R11 Winer, "From Hormuz to the Sahel: A Fertilizer Shock, and a Maghreb Solution" (MEI, 4 May 2026) | **first ≈3 of 7 pp** (stops mid-sentence) | `gga-r11` |
| R12 "Can the AI arms race be stopped?" (*The Economist*, 17 Sep 2026) | **opening paragraphs only** | `gga-r12` |

**Do not write a card in R4, R5, R8, R9, R11 or R12 from the lines alone.** Each of those decks is a
shortlist from the pages supplied; get the full text first (the owner can print or save the whole
document), and where the full text changes a line, change the line.

## The shape

| Deck | id | Cards | Numbers |
|---|---|---|---|
| Lecture 1 · Power centres and the new disorder | `gga-l1` | 28 | 001–028 |
| Lecture 2 · The military–political nexus | `gga-l2` | 36 | 029–064 |
| Lecture 3 · Economic diplomacy, humanitarian aid and development | `gga-l3` | 31 | 065–095 |
| Lecture 4 · Multilateralism and the Global South | `gga-l4` | 22 | 096–117 |
| Lecture 5 · Ukraine and the European security (dis)order | `gga-l5` | 31 | 118–148 |
| Lecture 6 · The international legal order | `gga-l6` | 20 | 149–168 |
| Lecture 7 · Russia | `gga-l7` | — | *awaiting slides* |
| Reading 1 · The Abandoned Order (Leonard) | `gga-r1` | 20 | 169–188 |
| Reading 2 · China, Iran sanctions and retaliation (FT) | `gga-r2` | 6 | 189–194 |
| Reading 3 · Humanitarian Diplomacy (De Lauri) | `gga-r3` | 12 | 195–206 |
| Reading 4 · In Defense of Ambition (Lindborg & Hewitt) | `gga-r4` | 8 | 207–214 |
| Reading 5 · The Weaponized World Economy (Farrell & Newman) | `gga-r5` | 8 | 215–222 |
| Reading 6 · Restructuring global supply chains (*The Economist*) | `gga-r6` | 10 | 223–232 |
| Reading 7 · The Long, Slow Death of Global Development (Oks & Williams) | `gga-r7` | 30 | 233–262 |
| Reading 8 · The Economic Legacy of Civil War (Collier & Duponchel) | `gga-r8` | 8 | 263–270 |
| Reading 9 · Globalization's Wrong Turn (Rodrik) | `gga-r9` | 8 | 271–278 |
| Reading 10 · Investing in Fragile and Conflict-Affected States (FMO) | `gga-r10` | 8 | 279–286 |
| Reading 11 · From Hormuz to the Sahel (Winer) | `gga-r11` | 8 | 287–294 |
| Reading 12 · Can the AI arms race be stopped? (*The Economist*) | `gga-r12` | 6 | 295–300 |
| **Total** | | **300** | 001–300 |

**168 lecture cards and 132 reading cards.** The numbering runs lectures first, then readings, and
**Lecture 7 will take `gga-301` onward when its slides land** — a card id is a permanent address, so
the blocks above are never renumbered to make room. The readings are in the order they appear on the
course's Brightspace page; which class each belongs to is only known for two (Lecture 3's slide on
readings says "focus on Rodrik + Farrell Newman").

## Open questions for the owner (none blocks writing the first lecture decks)

1. **Which lecture order is live?** The timetable on the final Lecture 1 deck lists *2 Global South &
   Value Systems (with Ambassador Rodrigues Pineda), 3 Economic Diplomacy, 4 Military Political Nexus
   (with Lt Gen Matthijssen)*; the draft timetable and the decks actually supplied run *2 Military
   Political Nexus (with Ivo Daalder), 3 Economic Diplomacy (with Bomberger), 4 Multilateral
   institutions and the Global South (with Fatima Denton)*. **This plan follows the decks' own titles.**
   If the published timetable is the live one, the Global South lecture (Rodrigues Pineda) has **not**
   been supplied and Lecture 4 here is the older Global South deck.
2. **The Lecture 1 draft** has material the final deck dropped (unknown unknowns, "events, events,
   events", protean power, "take back control", and a definition of diplomacy that is not carded).
   Four lines (`gga-025`–`gga-028`) are marked † as draft-only; strike them if the draft was not taught.
3. **Lecture 5 is called NATO on the timetable** and *Ukraine: Making Peace with a Revisionist Power* on
   its slides, and carries the Schuwer guest lecture. It is titled for its slides here.
4. **Collier & Duponchel:** send the 2013 JCR text (a screenshot of its pages is not enough) or say that
   the working paper may stand in.
5. **The Lecture 6 slides cite a reading list** (Shaw, Farer, Putin's 2014 and 2022 addresses, Chatham
   House, a run of 2022–2025 opinion pieces). None is in the Literature folder, so none is carded. Say
   so if any is examinable.

# The list

Lines marked † are from the Lecture 1 draft only. A note after the dash is a pointer to the source,
not an answer.

## Lecture 1 · Power centres and the new disorder — `gga-l1`

Source: Lecture 1 (*Diplomacy in Practice*), the framework and the vignettes. The Leonard article is
summarised on slide 14; it is carded in Reading 1.

  gga-001  Security, prosperity and values — the policy-goal triangle (Weerbaarheid, Welvaart, Waarden)
  gga-002  Power centres
  gga-003  Arenas where power is exercised
  gga-004  Worldviews
  gga-005  Personalities
  gga-006  Interregnum — Gramsci
  gga-007  Crisis of authority — the old order can no longer lead through consent
  gga-008  Post-unipolar world
  gga-009  Five superpowers — the US, China, India, Russia and the EU
  gga-010  Multi-alignment — "the à-la-carte world"
  gga-011  Shanghai Cooperation Organisation
  gga-012  Cold War mentality — Xi at the 2025 SCO summit
  gga-013  Europe's shrinking share of the world population — AIV chart
  gga-014  Asia displaces Europe as the Global South's main trading partner — 1995 against 2022
  gga-015  Weaponisation of everything
  gga-016  Mutually assured economic pain — the April–May 2025 US–China tariff climb-down
  gga-017  GPS spoofing
  gga-018  Revisionist powers — Russia, China, Turkey, Iran
  gga-019  Anti-colonialism
  gga-020  Comfort Ero — "What Malians mean when they talk of sovereignty"
  gga-021  Ibrahim Traoré — "no country has developed under democracy"
  gga-022  Two-level game
  gga-023  Sánchez and the 5 per cent target — NATO summit 2025
  gga-024  Radical uncertainty
  gga-025  Unknown unknowns — †
  gga-026  Events, events, events, my boy — † (Macmillan)
  gga-027  Protean power — †
  gga-028  Take back control — †

## Lecture 2 · The military–political nexus — `gga-l2`

Source: Lecture 2. **The Lecture 3 deck repeats the Mali and peacekeeping slides; every one of them
is filed here, once.**

  gga-029  Military–political nexus
  gga-030  Hybrid warfare — Kilcullen's account
  gga-031  David Kilcullen
  gga-032  Explosion of connectivity — iPad firing tables in Ukraine
  gga-033  States acting like nonstate actors
  gga-034  Mutually hurting stalemate
  gga-035  Drone warfare
  gga-036  Traditional peacekeeping — separation, ceasefire monitoring, buffer zones
  gga-037  The holy trinity of peacekeeping — consent, impartiality, non-use of force
  gga-038  United Nations Truce Supervision Organization — 1948
  gga-039  Multinational Force and Observers — 1983, Sinai
  gga-040  Generations of peacekeeping — first to fifth
  gga-041  Stabilisation missions — the fifth generation
  gga-042  Resolution 2085 — 20 December 2012
  gga-043  MINUSMA
  gga-044  Algiers Agreement — 2015
  gga-045  Africa Corps — the rebranded Wagner Group
  gga-046  Assimi Goïta
  gga-047  Barkhane
  gga-048  Penholder
  gga-049  Christmas tree mandates
  gga-050  The fatal trilogy — UNPROFOR, UNOSOM, UNAMIR
  gga-051  Independent inquiry into the Rwanda genocide
  gga-052  Blair Doctrine — Chicago, April 1999
  gga-053  Responsibility to Protect — the three pillars
  gga-054  Brahimi Report — 2000
  gga-055  High-level Independent Panel on Peace Operations (HIPPO)
  gga-056  Cruz Report — named on slide 31, not explained
  gga-057  Four essential shifts — primacy of politics, responsive operations, stronger partnerships, field focus
  gga-058  Peacekeeping without peace — "should they even be deployed when there is no peace to keep?"
  gga-059  Protection of civilians
  gga-060  Exit strategy
  gga-061  Jean-Marie Guéhenno — international organisations reflect the power dynamics of their members
  gga-062  Strategic retrenchment
  gga-063  Commodified peace — mediation as an arena for entrepreneurs (Kushner)
  gga-064  National caveats — the German Hercules at Kidal

## Lecture 3 · Economic diplomacy, humanitarian aid and development — `gga-l3`

Source: Lecture 3, including Kathryne Bomberger's guest lecture for the International Commission on
Missing Persons (ICMP). **The Rodrik-trilemma and WTO slides also appear in the Lecture 4 deck;
the trilemma is filed here and the WTO in Lecture 4.**

  gga-065  Wandel durch Annäherung
  gga-066  Dollar clearing system — sanctions on Iran and Afghanistan
  gga-067  SWIFT
  gga-068  Limits to chokepoints — alternatives and pipelines
  gga-069  TACO — as the slide uses it; research before writing
  gga-070  ASML
  gga-071  Rodrik's trilemma
  gga-072  America First — national sovereignty and democracy, limits on globalisation
  gga-073  Washington Consensus — national sovereignty and globalisation, limits on democracy
  gga-074  Ever closer union — globalisation and democracy, limits on national sovereignty
  gga-075  Policy space — the African objection to the Economic Partnership Agreements
  gga-076  Economic Partnership Agreements
  gga-077  Race to the bottom
  gga-078  Paris Agreement — sovereignty kept, enforceability lost
  gga-079  Nationally Determined Contributions
  gga-080  Hormuz–Sahel transmission — the assignment question and its model answer
  gga-081  Fiscal feedback loop — economic insecurity feeding political instability
  gga-082  Multilateral shock response — IMF, World Bank, African Union, conflict prevention
  gga-083  International Commission on Missing Persons
  gga-084  Enforced disappearance
  gga-085  International Convention for the Protection of All Persons from Enforced Disappearance
  gga-086  Right to the truth
  gga-087  Srebrenica — the 8,000 and the DNA identifications
  gga-088  DNA identification of the missing
  gga-089  Missing Persons Group — the regional body of the Western Balkans
  gga-090  Syria's missing — almost 300,000
  gga-091  Online Inquiry Center
  gga-092  State responsibility to investigate
  gga-093  Political will
  gga-094  Ukraine's missing persons
  gga-095  Centralised missing-persons mechanism

## Lecture 4 · Multilateralism and the Global South — `gga-l4`

Source: Lecture 4 (*The Global South and Multilateralism*; **the title slide is dated 22-09-2024 but
the content runs to September 2025 and later** — treat the dated facts as the deck's). The guest
speaker, Fatima Denton, appears only as a biography slide. The slides summarising Farrell and Newman
are carded in Reading 5.

  gga-096  Economic diplomacy — Barston's definition
  gga-097  The 0.7 per cent aid target
  gga-098  Aid conditionality — development cooperation used to sanction behaviour
  gga-099  Sri Lanka's Chinese debt
  gga-100  Lithuania and the Taiwanese office
  gga-101  Interconnected but fragmented — the paradox of the deck's opening slide
  gga-102  Most armed conflicts since 1946 — 2025
  gga-103  Partners for Multilateralism — Lula, Costa, Ruto, Carney
  gga-104  Core Charter principles — sovereignty, territorial integrity, human rights
  gga-105  Multilateralism as power politics — "by other means"
  gga-106  World Trade Organization — 1995, successor to the GATT of 1947
  gga-107  Most-favoured-nation principle
  gga-108  Doha Round
  gga-109  Appellate Body — paralysed since 2019
  gga-110  Plurilateral agreements
  gga-111  Ngozi Okonjo-Iweala
  gga-112  Stable core within an unstable equilibrium
  gga-113  Liberation Day
  gga-114  Over-dependence — on the US for demand, on China for supply
  gga-115  Two-tier world
  gga-116  Standard-setting power
  gga-117  Dependence and autarky — the balance on semiconductors

## Lecture 5 · Ukraine and the European security (dis)order — `gga-l5`

Source: Lecture 5 (*Ukraine: Making Peace with a Revisionist Power*). Slides 27–36 are blank in the
file; slide 25 is the cover of the AIV's *European guarantees for Ukraine's security* (2 July 2026) and
nothing more of it was supplied. **Mutually hurting stalemate is in Lecture 2; this deck takes the
rest of Zartman's apparatus.**

  gga-118  Ripeness — Zartman, 2001
  gga-119  The precipice
  gga-120  Incomplete mutually hurting stalemate — Ukraine
  gga-121  Limiting choices — Bosnia 1995 and the 1973 war
  gga-122  South Africa's preventative peace
  gga-123  Helsinki Final Act
  gga-124  Deterrence and dialogue
  gga-125  War guilt and reparations — Versailles
  gga-126  Marshall Plan — including the defeated
  gga-127  Clausewitz reversed
  gga-128  Hiroo Onoda
  gga-129  A Europe whole and free
  gga-130  Bush's "one inch" promise
  gga-131  Partnership for Peace
  gga-132  NATO–Russia Permanent Joint Council
  gga-133  Kosovo — Putin's touchstone
  gga-134  Munich Security Conference, 2007
  gga-135  Bucharest summit, 2008
  gga-136  Destructive ambiguity
  gga-137  Membership Action Plan
  gga-138  Minsk agreements
  gga-139  Wales summit, 2014
  gga-140  Nord Stream 2
  gga-141  Appeasement or gaining time
  gga-142  War is normalcy — Bertram against Mearsheimer
  gga-143  Absolute victory
  gga-144  Armistice agreement
  gga-145  Political settlement
  gga-146  Finlandisation
  gga-147  Dirty deal — Deen and De Baedts, 2025
  gga-148  Energy ceasefire

## Lecture 6 · The international legal order — `gga-l6`

Source: Lecture 6, the guest lecture by Dr Ernst Dijxhoorn. Its opening slides are Our World in Data
charts (child mortality, extreme poverty, nuclear stockpiles, battle deaths, conflict death rates) —
the lecture's own answer to "are the wars in Ukraine and the Middle East the final nails in the coffin of
the rules-based order?" The reading list on its slides is **not** carded (open question 5).

  gga-149  Horizontal legal order — international law as law
  gga-150  Sovereignty — Oppenheim's "most controversial" concept
  gga-151  Territorial integrity and non-interference
  gga-152  De iure belli ac pacis
  gga-153  The Anarchical Society
  gga-154  Charter of the United Nations
  gga-155  Rule of law — the UN's definition
  gga-156  Rules-based international order
  gga-157  Legitimacy, equity and self-confidence — the three challenges
  gga-158  Putin's Article 51 claim — the address of 24 February 2022
  gga-159  Double standards — Richard Gowan
  gga-160  Strategic Foresight Report 2025
  gga-161  International law is politics — but not just politics
  gga-162  International Law: 100 Ways It Shapes Our Lives
  gga-163  South China Sea arbitration — link-only slide
  gga-164  Arctic Sunrise — link-only slide
  gga-165  Bolton and the International Criminal Court — link-only slide
  gga-166  States behave as if bound
  gga-167  Conflict death rates, 2024 — the chart
  gga-168  Nuclear warhead stockpiles — the chart

## Lecture 7 — `gga-l7`

*Not yet written — the lecture it covers has not been supplied.*

## Reading 1 · The Abandoned Order (Leonard) — `gga-r1`

Mark Leonard, *Foreign Affairs*, Sep/Oct 2026. Complete.

  gga-169  Rotten-tail world — *lanwei lou*
  gga-170  Un-order
  gga-171  Kissinger's two pillars
  gga-172  Fragmentation, contagion and strangulation
  gga-173  Epistemic fragmentation
  gga-174  Pax Silica
  gga-175  Brent–physical price spread
  gga-176  Disinhibition
  gga-177  Chokepoints as a marker of power
  gga-178  Foreign direct product rule — China, late 2025
  gga-179  The 2010 rare-earth cut-off to Japan
  gga-180  Russian reserves freeze — 2022
  gga-181  Strait of Hormuz
  gga-182  Architects and artisans
  gga-183  Artisan state
  gga-184  Lobito Corridor
  gga-185  Hedgehog strategies
  gga-186  Frugal ways of war
  gga-187  Technological sovereignty
  gga-188  Carbon Border Adjustment Mechanism

## Reading 2 · China, Iran sanctions and retaliation (FT) — `gga-r2`

Joe Leahy, *Financial Times*, 25 August 2026. Complete.

  gga-189  Secondary sanctions
  gga-190  Teapot refiners
  gga-191  China's anti-sanctions regime
  gga-192  One-year trade truce — Trump and Xi
  gga-193  Ninety per cent of Iran's oil
  gga-194  Illicit unilateral sanctions — the Chinese foreign ministry's position

## Reading 3 · Humanitarian Diplomacy (De Lauri) — `gga-r3`

Antonio De Lauri, CMI Brief 2018:4. Complete.

  gga-195  Humanitarian diplomacy
  gga-196  Compromise against principle — the tension inside "humanitarian diplomacy"
  gga-197  Humanitarian principles — humanity, neutrality, impartiality, independence
  gga-198  Neutrality
  gga-199  Politicisation of access to aid
  gga-200  Safe havens
  gga-201  Turkey's humanitarian diplomacy
  gga-202  The non-stop mediator — Qatar
  gga-203  International Humanitarian City
  gga-204  UAE Soft Power Strategy
  gga-205  Leave no one behind
  gga-206  Advocacy networks

## Reading 4 · In Defense of Ambition (Lindborg & Hewitt) — `gga-r4`

*Dædalus*, Winter 2018 — **pp. 158–160 of the essay only; a shortlist** (see the status table).

  gga-207  State fragility
  gga-208  Shared consciousness — McChrystal
  gga-209  Stovepiped bureaucracies
  gga-210  Legitimacy and effectiveness
  gga-211  Breakdown of the social contract
  gga-212  Internationalised internal conflicts
  gga-213  The fifty most fragile states
  gga-214  Intelligent orchestration

## Reading 5 · The Weaponized World Economy (Farrell & Newman) — `gga-r5`

*Foreign Affairs*, Sep/Oct 2025 — **the opening and the Lecture 4 summary only; a shortlist.**

  gga-215  Weaponised interdependence
  gga-216  The June 2025 framework deal
  gga-217  Technological stack
  gga-218  Rare-earth refining
  gga-219  TSMC
  gga-220  Nvidia
  gga-221  EuroStack
  gga-222  Whole-of-nation approach

## Reading 6 · Restructuring global supply chains (*The Economist*) — `gga-r6`

*The Economist*, 16 June 2022. Complete.

  gga-223  Slowbalisation
  gga-224  Efficiency against resilience
  gga-225  Change through trade
  gga-226  Precautionary inventories
  gga-227  Strategic autonomy
  gga-228  Dual sourcing
  gga-229  Vertical integration
  gga-230  Local reinvestment
  gga-231  Autocracies' chokepoints
  gga-232  Subsidised bunker

## Reading 7 · The Long, Slow Death of Global Development (Oks & Williams) — `gga-r7`

*American Affairs*, Winter 2022. Complete, with its footnotes.

  gga-233  No development without industrialisation
  gga-234  Unconditional convergence
  gga-235  Rostow's take-off
  gga-236  Manufacturing employment share
  gga-237  China's share of poverty reduction
  gga-238  Statistical compensation
  gga-239  The $2.15-a-day line
  gga-240  Commodity supercycle
  gga-241  The golden age of development
  gga-242  Ivorian miracle
  gga-243  Volcker shock
  gga-244  Década perdida
  gga-245  Structural adjustment
  gga-246  Government by means of the aid industry
  gga-247  Premature deindustrialisation
  gga-248  Deagrarianisation
  gga-249  Planet of slums
  gga-250  Decomplexification
  gga-251  Reprimarisation
  gga-252  Pink Tide
  gga-253  Hayateen
  gga-254  Wage hunters and gatherers
  gga-255  Premature financialisation
  gga-256  Remittances as lifelines
  gga-257  Flying geese
  gga-258  Middle-income trap
  gga-259  Brazilianisation
  gga-260  Farmer–herder conflict
  gga-261  Africa's population boom
  gga-262  The problem of the border line

## Reading 8 · The Economic Legacy of Civil War (Collier & Duponchel) — `gga-r8`

*Journal of Conflict Resolution*, 2013. **Planned from the 2010 working paper (UNU-WIDER WP 2010/90);
the assigned text is not in hand — see open question 4.**

  gga-263  Forgetting by not doing
  gga-264  Technical regress
  gga-265  Sierra Leone's civil war, 1991–2002
  gga-266  Revolutionary United Front
  gga-267  Sierra Leone Employers Survey
  gga-268  Geographic variation in conflict intensity
  gga-269  A lower bound
  gga-270  Output rebound after civil war

## Reading 9 · Globalization's Wrong Turn (Rodrik) — `gga-r9`

*Foreign Affairs*, Jul/Aug 2019 — **pp. 26–27 of 26–33; a shortlist.** The trilemma is in Lecture 3.

  gga-271  Hyperglobalisation
  gga-272  Gold standard
  gga-273  Bretton Woods
  gga-274  Golden straitjacket
  gga-275  Behind-the-border rules
  gga-276  Capital-account liberalisation
  gga-277  Globalisation as a force of nature
  gga-278  Austerity after the crash

## Reading 10 · Investing in Fragile and Conflict-Affected States (FMO) — `gga-r10`

FMO, with the NIRAS and TrustWorks Global study. Complete.

  gga-279  Fragile and conflict-affected states
  gga-280  Development finance institutions
  gga-281  MASSIF
  gga-282  Conflict sensitivity
  gga-283  Do no harm
  gga-284  Competing sources of governance
  gga-285  Humanitarian–development–peace nexus
  gga-286  Transformative development impact

## Reading 11 · From Hormuz to the Sahel (Winer) — `gga-r11`

Jonathan M. Winer, Middle East Institute, 4 May 2026 — **the first three of seven pages; a shortlist.**

  gga-287  Lean season
  gga-288  Urea price spike
  gga-289  Rain-fed planting window
  gga-290  Liptako-Gourma
  gga-291  OCP Group
  gga-292  Imported sulfur
  gga-293  Algeria's gas-to-nitrogen link
  gga-294  Egypt's urea and wheat

## Reading 12 · Can the AI arms race be stopped? (*The Economist*) — `gga-r12`

*The Economist*, 17 September 2026 — **the opening paragraphs only; a shortlist.**

  gga-295  Pace the frontier
  gga-296  Alignment
  gga-297  Agents escaping their sandboxes
  gga-298  Misuse by malign actors
  gga-299  Millennium Prize problem
  gga-300  AI in the destruction of Ukraine

# Before the first card

The plan is complete; the collection is not yet wired. In this order, in one commit:

1. **`COLLECTION_TREE` in `data.js`** (edited as text — `writeCards` ignores the tree): a `gga` collection,
   *Gateway to Global Affairs*, with the 19 decks above as leaves (`gga-l1`…`gga-l7`, `gga-r1`…`gga-r12`).
   Empty decks are coming-soon automatically. Copy the shape of the `pea` node.
2. **`app.js`**: `COLLECTION_SECTION` (`gga` → `Special`), the collection's colour block beside
   `pea`'s, and its date in the "new" table beside `pea: "2026-09-17"`.
3. **`.claude/test-card-plans.js`**: add `"gateway-to-global-affairs": ["gga", "gga-", [[1, 300]]]`, and
   **a row in `CLAUDE.md`'s collection table** (the test requires one per plan).
4. **`docs/README.md`** and **`docs/reference.md`** (the plan's bullet and the table row).
5. **A changelog line and a version bump** — the collection reaches readers.

Run `node .claude/test-card-plans.js` and `node .claude/check-docs.js` after.
