# Draw the flags — the running order

**READ BEFORE WRITING AN `fd-` CARD, OR BEFORE TOUCHING THE DRAW-CARD FORMAT.**

The **Draw the flags** deck (`flags-draw`), the fourth deck of World Geography and the reverse direction
of **The flags**. `fl-007` shows Brazil's flag and asks whose it is; `fd-007` names Brazil and asks the
reader to draw its flag from memory, on a canvas with its own pens, colours and a fill — and then to
reveal the flag and judge how close they came.

It shipped in Sep 2026 on request: *"Make a reverse version of each card (similar to language vocabulary
cards) where the user is given a small canvas and the floating whiteboard marker is pinned to the top
right of the canvas. The user must draw the flag from memory and can then judge how correct they were."*
The pinned marker was the first cut and **was replaced the same day**, on a second request: *"keep the
floating marker separate, simply put a separate whiteboard menu in the top of the white canvas which can
only be used within that canvas, and also includes a fill option to fill the whole canvas a particular
color."* **The Format section below is the reasoning; read it before changing any of it**, because the
arrangement that was refused is the obvious one.

**233 numbers, 229 writable cards.** The four deferrals are the Flags deck's own, for its own reasons:
`fd-036` Afghanistan, `fd-171` Western Sahara, `fd-180` New Caledonia and `fd-218` Saint Martin. A card
here asks for a flag to be drawn and then shows it, so an entity Folio cannot show a flag for has nothing
to draw either — the deferral travels with the twin by arithmetic rather than by a second judgement.
Their numbers stay reserved; see `docs/flags-card-plan.md` for what each refusal rests on.

## What this deck is for

Recognition and production are different things, and a flag deck that only ever asks for recognition
teaches only the easier of the two. A reader who can name the flag of Slovakia on sight very often cannot
say which way its bands run, where the arms sit, or whether the cross is white or yellow — and the only
way to find that out is to be asked to produce it. This is the second direction of a language deck's
vocabulary note, which is exactly the shape the request named.

**IT IS A SEPARATE DECK AND NOT AN OPTION ON THE FIRST ONE, deliberately.** A language deck gets both
directions from one note through its templates, and `deckPairNew` lets a reader turn one off; curated
cards have no note layer, so the reverse has to be a card of its own — and once it is a card, a deck of
its own is what gives the reader the choice the language decks get from that option. Add it and you study
both ways; leave it and The flags is what it always was.

## Three decisions

**THE NUMBER IS THE ENTITY AND THE PREFIX IS THE QUESTION.** `gw-007`, `fl-007` and `fd-007` are all
Brazil — the shape on a globe, the flag named, the flag drawn. The +500 pairing the geography section
uses elsewhere (`gw-507` is Brasília, `geo-501` is Montgomery) means a **different** entity at the same
number, so reusing it here would have made `fl-507` Brazil while `gw-507` was Brasília, and
`check-flag-twins.js` — which pairs `fl-NNN` with `gw-NNN` by arithmetic — would have compared a drawing
card against a capital. A prefix of its own costs one row in `test-card-plans.js` and leaves `fl-501`+
free for the subnational flags the Flags plan reserves it for.

**THE WHOLE ANSWER SIDE IS THE TWIN'S, COPIED.** Same answer term, same date line, same figures grid,
same background, same citations, same tags and difficulty — which is the standing request that the flags
decks reuse World Geography's answer side, one deck further on. `.claude/add-draw-cards.js` does the copy
and hands each finished card to `add-card.js`, so a draw card is no research and no glossary work at all.
The standing cost is the one the Flags deck already carries and which `check-flag-twins.js` was written
for: **a correction to a `gw-` background must now travel to TWO twins in the same commit.**

**THE PROMPT NAMES THE COUNTRY AND CARRIES NO CLOZE BLANK.** It is the one card format on the site with
nothing to type: the answer is a drawing, and the reader grades it on the four buttons the grade bar
already has, which is what self-assessment here has always been. `add-card.js` and `check-questions.js`
both refuse a blank on one — a blank would put an ungradeable field on the card and, under the *Answer
before revealing* policy, a gate the reader could never pass.

## The format

Built into app.js as `drawCard: true` beside `flagCard`, and specified in the **DRAW CARDS** block there.

**THE PAD IS ITS OWN CANVAS WITH ITS OWN MENU, AND THIS REVERSED THE FIRST CUT.** The pad began as a
FRAME over the page-wide floating whiteboard, with the marker pinned to its top-right corner and the pen
put down for the reader. That reused the marker's pointer handling, undo stack, stylus rule and colour
state and cost nothing — and it could not answer the request that followed it (Sep 2026: *"keep the
floating marker separate, simply put a separate whiteboard menu in the top of the white canvas which can
only be used within that canvas, and also includes a fill option to fill the whole canvas a particular
color"*). Ink on a page-wide canvas is bounded by nothing, the marker had to be pinned to be reachable at
all, and there is nowhere in it for a fill to stop. **A bounded surface is a canvas of its own**, so the
duplication that was refused is now the point.

Six things follow, and each is a decision rather than plumbing.

- **The floating marker is left entirely alone.** Not pinned, not auto-enabled. With its pen down it
  draws *over* the pad, as it does over everything else on the page, and the pad's menu goes on working —
  its buttons are real controls the ink layer already hit-tests through to. A pass-through that forwarded
  presses into the pad was built and refused: it would take away the one thing the floating marker is
  for, which is annotating anything on the page, a diagram included.
- **The menu sits on the canvas's top edge**: five colours, a pen, a broad pen, an eraser, **fill**, undo
  and clear. On a narrow phone it wraps to two rows rather than shrinking its targets.
- **Fill covers, rather than going underneath.** "Fill the whole canvas a particular color" is literal,
  and it is undoable, so a mis-press costs one press. Going underneath would be a different tool wearing
  this one's name — and a reader drawing a flag fills the field first anyway.
- **The canvas is sized from LAYOUT, never from a rect.** `getBoundingClientRect` is transform-aware and
  the page's entrance animation scales `.page` for its first third of a second, so a canvas sized from a
  rect at mount comes out several pixels narrow and **stays** that way: a transform changes no layout box,
  so the ResizeObserver never fires to correct it. Measured: 349px of canvas inside a 355.6px frame, a
  white strip down the right of every pad. The same fault the pin had, which is what says to expect it of
  anything measured at mount on this page.
- **`touch-action:none` is what lets a finger draw**, at the stated cost that a finger starting inside the
  pad cannot scroll the page — exactly as on the floating marker's own canvas.
- **The pad does not move when the answer lands.** The revealed flag is appended below it, at the same
  width, so the two can be compared at a glance.

**The menu is `aria-hidden` and its controls carry `tabindex="-1"` with it.** That pairing is the point:
an `aria-hidden` container whose children are still focusable is the one arrangement worse than either
choice, since a keyboard reader tabs onto a control their screen reader has been told does not exist and
lands on it silently. Hidden from assistive technology *and* out of the tab order is one statement rather
than two contradictory ones, and it costs a pointer nothing — which is what this surface needs anyway,
a tool being unusable from a keyboard on a canvas that cannot be drawn on from one. The question above
the pad and the answer below it are both real text, which is where this format's accessibility lives.

The tool, colour and size live in a module-level `DP` and are **not stored**: which colour you last drew a
flag in is a way of working rather than a preference about Folio.

Guarded by `.claude/test-draw-cards.js`.

# The list

**The bracket on each line names the twin it is copied from.** This plan names the ANSWER rather than a
subject to research, so `test-card-plans.js` checks the NAME as well as the number and a card shipping at
the wrong id is a fault that suite can see. The order is the Flags deck's order, which is World
Geography's order, which is by population, largest first — **fixed at planning time and never re-sorted**,
a card id being a permanent address.

## Draw the flags — `flags-draw`

  fd-001  India  [fl-001]
  fd-002  China  [fl-002]
  fd-003  United States  [fl-003]
  fd-004  Indonesia  [fl-004]
  fd-005  Pakistan  [fl-005]
  fd-006  Nigeria  [fl-006]
  fd-007  Brazil  [fl-007]
  fd-008  Bangladesh  [fl-008]
  fd-009  Russia  [fl-009]
  fd-010  Ethiopia  [fl-010]
  fd-011  Mexico  [fl-011]
  fd-012  Japan  [fl-012]
  fd-013  Egypt  [fl-013]
  fd-014  Philippines  [fl-014]
  fd-015  Democratic Republic of the Congo  [fl-015]
  fd-016  Vietnam  [fl-016]
  fd-017  Iran  [fl-017]
  fd-018  Turkey  [fl-018]
  fd-019  Germany  [fl-019]
  fd-020  Thailand  [fl-020]
  fd-021  United Kingdom  [fl-021]
  fd-022  Tanzania  [fl-022]
  fd-023  France  [fl-023]
  fd-024  South Africa  [fl-024]
  fd-025  Italy  [fl-025]
  fd-026  Kenya  [fl-026]
  fd-027  Myanmar  [fl-027]
  fd-028  Colombia  [fl-028]
  fd-029  South Korea  [fl-029]
  fd-030  Sudan  [fl-030]
  fd-031  Uganda  [fl-031]
  fd-032  Spain  [fl-032]
  fd-033  Algeria  [fl-033]
  fd-034  Iraq  [fl-034]
  fd-035  Argentina  [fl-035]
  fd-036  DEFERRED  [Afghanistan — Commons resolves the flag to the Taliban’s — no flag to draw]
  fd-037  Canada  [fl-037]
  fd-038  Yemen  [fl-038]
  fd-039  Morocco  [fl-039]
  fd-040  Angola  [fl-040]
  fd-041  Ukraine  [fl-041]
  fd-042  Poland  [fl-042]
  fd-043  Uzbekistan  [fl-043]
  fd-044  Malaysia  [fl-044]
  fd-045  Saudi Arabia  [fl-045]
  fd-046  Mozambique  [fl-046]
  fd-047  Ghana  [fl-047]
  fd-048  Peru  [fl-048]
  fd-049  Madagascar  [fl-049]
  fd-050  Côte d'Ivoire  [fl-050]
  fd-051  Nepal  [fl-051]
  fd-052  Cameroon  [fl-052]
  fd-053  Venezuela  [fl-053]
  fd-054  Australia  [fl-054]
  fd-055  Niger  [fl-055]
  fd-056  North Korea  [fl-056]
  fd-057  Syria  [fl-057]
  fd-058  Mali  [fl-058]
  fd-059  Burkina Faso  [fl-059]
  fd-060  Taiwan  [fl-060]
  fd-061  Sri Lanka  [fl-061]
  fd-062  Malawi  [fl-062]
  fd-063  Zambia  [fl-063]
  fd-064  Kazakhstan  [fl-064]
  fd-065  Chad  [fl-065]
  fd-066  Chile  [fl-066]
  fd-067  Romania  [fl-067]
  fd-068  Somalia  [fl-068]
  fd-069  Senegal  [fl-069]
  fd-070  Guatemala  [fl-070]
  fd-071  Ecuador  [fl-071]
  fd-072  Netherlands  [fl-072]
  fd-073  Cambodia  [fl-073]
  fd-074  Zimbabwe  [fl-074]
  fd-075  Guinea  [fl-075]
  fd-076  Benin  [fl-076]
  fd-077  Rwanda  [fl-077]
  fd-078  Burundi  [fl-078]
  fd-079  Bolivia  [fl-079]
  fd-080  Tunisia  [fl-080]
  fd-081  South Sudan  [fl-081]
  fd-082  Belgium  [fl-082]
  fd-083  Haiti  [fl-083]
  fd-084  Jordan  [fl-084]
  fd-085  Dominican Republic  [fl-085]
  fd-086  United Arab Emirates  [fl-086]
  fd-087  Cuba  [fl-087]
  fd-088  Czechia  [fl-088]
  fd-089  Honduras  [fl-089]
  fd-090  Portugal  [fl-090]
  fd-091  Tajikistan  [fl-091]
  fd-092  Papua New Guinea  [fl-092]
  fd-093  Sweden  [fl-093]
  fd-094  Greece  [fl-094]
  fd-095  Azerbaijan  [fl-095]
  fd-096  Israel  [fl-096]
  fd-097  Hungary  [fl-097]
  fd-098  Austria  [fl-098]
  fd-099  Belarus  [fl-099]
  fd-100  Switzerland  [fl-100]
  fd-101  Sierra Leone  [fl-101]
  fd-102  Togo  [fl-102]
  fd-103  Laos  [fl-103]
  fd-104  Hong Kong  [fl-104]
  fd-105  Turkmenistan  [fl-105]
  fd-106  Libya  [fl-106]
  fd-107  Kyrgyzstan  [fl-107]
  fd-108  Paraguay  [fl-108]
  fd-109  Nicaragua  [fl-109]
  fd-110  Serbia  [fl-110]
  fd-111  Bulgaria  [fl-111]
  fd-112  El Salvador  [fl-112]
  fd-113  Republic of the Congo  [fl-113]
  fd-114  Singapore  [fl-114]
  fd-115  Denmark  [fl-115]
  fd-116  Lebanon  [fl-116]
  fd-117  Finland  [fl-117]
  fd-118  Liberia  [fl-118]
  fd-119  Norway  [fl-119]
  fd-120  Slovakia  [fl-120]
  fd-121  Ireland  [fl-121]
  fd-122  Central African Republic  [fl-122]
  fd-123  New Zealand  [fl-123]
  fd-124  Palestine  [fl-124]
  fd-125  Oman  [fl-125]
  fd-126  Mauritania  [fl-126]
  fd-127  Costa Rica  [fl-127]
  fd-128  Kuwait  [fl-128]
  fd-129  Panama  [fl-129]
  fd-130  Croatia  [fl-130]
  fd-131  Georgia  [fl-131]
  fd-132  Eritrea  [fl-132]
  fd-133  Mongolia  [fl-133]
  fd-134  Uruguay  [fl-134]
  fd-135  Puerto Rico  [fl-135]
  fd-136  Bosnia and Herzegovina  [fl-136]
  fd-137  Armenia  [fl-137]
  fd-138  Namibia  [fl-138]
  fd-139  Lithuania  [fl-139]
  fd-140  Qatar  [fl-140]
  fd-141  Jamaica  [fl-141]
  fd-142  Gambia  [fl-142]
  fd-143  Gabon  [fl-143]
  fd-144  Botswana  [fl-144]
  fd-145  Moldova  [fl-145]
  fd-146  Albania  [fl-146]
  fd-147  Lesotho  [fl-147]
  fd-148  Guinea-Bissau  [fl-148]
  fd-149  Slovenia  [fl-149]
  fd-150  Equatorial Guinea  [fl-150]
  fd-151  Latvia  [fl-151]
  fd-152  North Macedonia  [fl-152]
  fd-153  Kosovo  [fl-153]
  fd-154  Bahrain  [fl-154]
  fd-155  Timor-Leste  [fl-155]
  fd-156  Estonia  [fl-156]
  fd-157  Trinidad and Tobago  [fl-157]
  fd-158  Cyprus  [fl-158]
  fd-159  Mauritius  [fl-159]
  fd-160  Eswatini  [fl-160]
  fd-161  Djibouti  [fl-161]
  fd-162  Fiji  [fl-162]
  fd-163  Comoros  [fl-163]
  fd-164  Guyana  [fl-164]
  fd-165  Solomon Islands  [fl-165]
  fd-166  Bhutan  [fl-166]
  fd-167  Macau  [fl-167]
  fd-168  Luxembourg  [fl-168]
  fd-169  Suriname  [fl-169]
  fd-170  Montenegro  [fl-170]
  fd-171  DEFERRED  [Western Sahara — Commons resolves the flag to the SADR’s — no flag to draw]
  fd-172  Malta  [fl-172]
  fd-173  Maldives  [fl-173]
  fd-174  Cabo Verde  [fl-174]
  fd-175  Brunei  [fl-175]
  fd-176  Belize  [fl-176]
  fd-177  Bahamas  [fl-177]
  fd-178  Iceland  [fl-178]
  fd-179  Vanuatu  [fl-179]
  fd-180  DEFERRED  [New Caledonia — two co-official flags, one of them France’s — no flag to draw]
  fd-181  Barbados  [fl-181]
  fd-182  French Polynesia  [fl-182]
  fd-183  São Tomé and Príncipe  [fl-183]
  fd-184  Samoa  [fl-184]
  fd-185  Saint Lucia  [fl-185]
  fd-186  Guam  [fl-186]
  fd-187  Curaçao  [fl-187]
  fd-188  Kiribati  [fl-188]
  fd-189  Seychelles  [fl-189]
  fd-190  Grenada  [fl-190]
  fd-191  Micronesia  [fl-191]
  fd-192  Aruba  [fl-192]
  fd-193  United States Virgin Islands  [fl-193]
  fd-194  Tonga  [fl-194]
  fd-195  Jersey  [fl-195]
  fd-196  Saint Vincent and the Grenadines  [fl-196]
  fd-197  Antigua and Barbuda  [fl-197]
  fd-198  Isle of Man  [fl-198]
  fd-199  Andorra  [fl-199]
  fd-200  Cayman Islands  [fl-200]
  fd-201  Guernsey  [fl-201]
  fd-202  Dominica  [fl-202]
  fd-203  Bermuda  [fl-203]
  fd-204  Greenland  [fl-204]
  fd-205  Faroe Islands  [fl-205]
  fd-206  Saint Kitts and Nevis  [fl-206]
  fd-207  American Samoa  [fl-207]
  fd-208  Turks and Caicos Islands  [fl-208]
  fd-209  Northern Mariana Islands  [fl-209]
  fd-210  Sint Maarten  [fl-210]
  fd-211  Liechtenstein  [fl-211]
  fd-212  British Virgin Islands  [fl-212]
  fd-213  Gibraltar  [fl-213]
  fd-214  Monaco  [fl-214]
  fd-215  Marshall Islands  [fl-215]
  fd-216  San Marino  [fl-216]
  fd-217  Åland  [fl-217]
  fd-218  DEFERRED  [Saint Martin — Commons names no flag of it — no flag to draw]
  fd-219  Anguilla  [fl-219]
  fd-220  Palau  [fl-220]
  fd-221  Cook Islands  [fl-221]
  fd-222  Nauru  [fl-222]
  fd-223  Wallis and Futuna  [fl-223]
  fd-224  Saint Barthélemy  [fl-224]
  fd-225  Tuvalu  [fl-225]
  fd-226  Saint Pierre and Miquelon  [fl-226]
  fd-227  Saint Helena  [fl-227]
  fd-228  Montserrat  [fl-228]
  fd-229  Falkland Islands  [fl-229]
  fd-230  Norfolk Island  [fl-230]
  fd-231  Niue  [fl-231]
  fd-232  Vatican City  [fl-232]
  fd-233  Pitcairn Islands  [fl-233]
