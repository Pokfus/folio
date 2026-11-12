"""The C1 inventory: the words the Arabic C1 deck teaches, on top of the shipped A1 to B2.

Written as `inventory.py` is (read its header: one line a word, `vowelled headword
| part of speech | English`, the English the card's own), for the CEFR C1
descriptor's "demanding, longer texts" and "implicit meaning": the abstract,
formal and literary vocabulary of essays, editorials, speeches and novels — shades
of judgement and feeling, power and law, thought and language, and the verbs of
reasoning, persuasion and change.  SINGLE WORDS ONLY: B2 found that Wiktionary
carries few multi-word terms (`docs/arabic-decks-plan.md` §5).  There is still no
exam board's list to read.

A word a shipped lower deck teaches is never a line here (`select.py` stops on
one).  The lower inventories' lines that every lower deck left out are CARRIED
into this level by `select.py` and compete on the same count.
"""

TOPICS = [
("thought, judgement and argument", """
اِسْتِدْلَال | noun | reasoning, inference
اِسْتِقْرَاء | noun | induction
قَرِينَة | noun | circumstantial evidence; context
مُسَلَّمَة | noun | axiom, given
بَدِيهَة | noun | intuition, self-evident truth
شُبْهَة | noun | suspicion; specious argument
مُغَالَطَة | noun | fallacy
ذَرِيعَة | noun | pretext
مُبَرِّر | noun | justification
حَيْثِيَّة | noun | consideration, respect
اِعْتِبَار | noun | consideration, regard
مُلَابَسَة | noun | circumstance
مُعْطًى | noun | given, datum
مَعْلُومَة | noun | piece of information
مُعْضِلَة | noun | dilemma
إِشْكَالِيَّة | noun | problematic issue
إِشْكَال | noun | difficulty, ambiguity
مَغْزًى | noun | moral, significance
فَحْوَى | noun | gist, purport
مَآل | noun | outcome, final result
عَاقِبَة | noun | consequence
حَصِيلَة | noun | tally, outcome
مُحَصِّلَة | noun | net result
مُقَارَبَة | noun | approach
مَنْظُور | noun | perspective
رُؤْيَا | noun | vision, dream
تَنْظِير | noun | theorising
تَأْوِيل | noun | interpretation (of a text)
اِجْتِهَاد | noun | independent reasoning; diligence
جُمُود | noun | rigidity, stagnation
تَزَمُّت | noun | strictness, puritanism
تَعَصُّب | noun | fanaticism, bigotry
اِنْحِيَاز | noun | bias, partiality
حِيَاد | noun | neutrality
مُحَايِد | adj | neutral
إِنْصَاف | noun | fairness
نَزَاهَة | noun | integrity
تَجَرُّد | noun | impartiality, detachment
اِسْتِخْفَاف | noun | disdain, belittling
تَهْوِين | noun | playing down
تَهْوِيل | noun | exaggeration, alarmism
تَشْكِيك | noun | casting doubt
اِسْتِهْجَان | noun | disapproval
اِسْتِحْسَان | noun | approval
إِجْمَاع | noun | consensus
بَدِيهِيَّة | noun | axiom
"""),
("feeling and the inner life", """
وِجْدَان | noun | conscience, inner feeling
حَسْرَة | noun | sorrow, regret
أَسًى | noun | grief
لَوْعَة | noun | anguish
كَآبَة | noun | gloom, melancholy
قُنُوط | noun | despair
تَفَاؤُل | noun | optimism
تَشَاؤُم | noun | pessimism
لَهْفَة | noun | eagerness, longing
هُيَام | noun | passionate love
شَغَف | noun | passion
نَشْوَة | noun | elation, ecstasy
غِبْطَة | noun | bliss
بَهْجَة | noun | delight
اِبْتِهَاج | noun | rejoicing
رِضًا | noun | contentment, approval
سُخْط | noun | indignation
حَنَق | noun | rage
غَيْظ | noun | fury
ضَغِينَة | noun | grudge
حِقْد | noun | rancour, hatred
بُغْض | noun | loathing
اِزْدِرَاء | noun | contempt
رَهْبَة | noun | awe, dread
وَجَل | noun | apprehension
هَلَع | noun | panic, alarm
اِضْطِرَاب | noun | disturbance, disorder
قَلَاقِل | noun | unrest
تَوَجُّس | noun | misgiving
رِيبَة | noun | suspicion
حَيْرَة | noun | bewilderment
دَهَاء | noun | cunning, shrewdness
فِطْنَة | noun | astuteness
بَلَاهَة | noun | foolishness
رَزَانَة | noun | composure
وَقَار | noun | dignity, gravity
طَيْش | noun | rashness
حَصَافَة | noun | prudence
مُرُوءَة | noun | chivalry, decency
شَهَامَة | noun | gallantry
نُبْل | noun | nobility
خِسَّة | noun | baseness
وَقَاحَة | noun | impudence
حَيَاء | noun | modesty, bashfulness
غُرُور | noun | conceit
عَجْرَفَة | noun | arrogance
تَمَلُّق | noun | flattery
رِيَاء | noun | hypocrisy, showing off
نِفَاق | noun | hypocrisy
"""),
("people and character", """
وَقُور | adj | dignified
حَصِيف | adj | prudent
فَطِن | adj | astute
دَاهِيَة | noun | mastermind; calamity
مُتَهَوِّر | adj | reckless
طَائِش | adj | rash, flighty
مُتَقَلِّب | adj | fickle, changeable
مُتَشَدِّد | adj | hardline
مُتَزَمِّت | adj | puritanical
مُحَافِظ | adj | conservative
رَجْعِيّ | adj | reactionary
تَقَدُّمِيّ | adj | progressive
عَنِيف | adj | violent
وَدِيع | adj | gentle, meek
مُشَاكِس | adj | troublesome, quarrelsome
مُتَمَرِّد | adj | rebellious; a rebel
خَنُوع | adj | submissive
ذَلِيل | adj | humiliated, abject
شَامِخ | adj | lofty, towering
مُتَمَلِّق | adj | sycophantic
مُرَاءٍ | adj | hypocritical
وَفِير | adj | abundant
زَاهِد | adj | ascetic
مُسْرِف | adj | extravagant
شَحِيح | adj | scarce; miserly
سَخِيّ | adj | generous
مِعْطَاء | adj | giving, generous
دَؤُوب | adj | tireless
بَلِيغ | adj | eloquent; profound
ثَرْثَار | adj | talkative
كَتُوم | adj | discreet, secretive
مُرَاوِغ | adj | evasive
وَصِيّ | noun | guardian, executor
وَلِيّ | noun | guardian; saint
نَدِيم | noun | boon companion
نَظِير | noun | counterpart, peer
غَرِيم | noun | rival; creditor
وَسِيط | noun | mediator
سِمْسَار | noun | broker
"""),
("power, society and the state", """
سُلْطَوِيّ | adj | authoritarian
طَاغِيَة | noun | tyrant
طُغْيَان | noun | tyranny
جَبَرُوت | noun | might, tyranny
بَطْش | noun | oppression, brutality
قَهْر | noun | oppression, subjugation
اِضْطِهَاد | noun | persecution
قَمْع | noun | repression
كَبْت | noun | suppression
وِصَايَة | noun | guardianship, tutelage
تَبَعِيَّة | noun | dependency
اِنْتِدَاب | noun | mandate
شَرْعِيَّة | noun | legitimacy
مَشْرُوعِيَّة | noun | lawfulness
اِسْتِحْقَاق | noun | entitlement; due date
تَفْوِيض | noun | mandate, delegation
تَعَدُّدِيَّة | noun | pluralism
عِلْمَانِيَّة | noun | secularism
عِلْمَانِيّ | adj | secular
لِيبِرَالِيَّة | noun | liberalism
اِشْتِرَاكِيَّة | noun | socialism
رَأْسِمَالِيَّة | noun | capitalism
شُيُوعِيَّة | noun | communism
قَوْمِيَّة | noun | nationalism
وَطَنِيَّة | noun | patriotism
شَعْبَوِيَّة | noun | populism
نُخْبَة | noun | elite
جَمَاهِير | noun | masses
حَرَاك | noun | movement, mobilisation
اِحْتِجَاج | noun | protest
عِصْيَان | noun | disobedience
تَمَرُّد | noun | rebellion
اِنْتِفَاضَة | noun | uprising
فِتْنَة | noun | strife, sedition; charm
تَصْعِيد | noun | escalation
مُصَالَحَة | noun | reconciliation
تَسْوِيَة | noun | settlement
وَسَاطَة | noun | mediation
مُبَادَلَة | noun | exchange, swap
تَنَازُل | noun | concession
اِبْتِزَاز | noun | blackmail
مُسَاوَمَة | noun | bargaining
اِمْتِيَاز | noun | privilege, concession
وَاسِطَة | noun | connections, influence
تَزْكِيَة | noun | endorsement
اِسْتِقْطَاب | noun | polarisation
تَكَافُؤ | noun | equivalence, parity
عَدْل | noun | justice, fairness
جَوْر | noun | injustice, tyranny
مَظْلُوم | adj | wronged, oppressed
ظَالِم | adj | unjust; an oppressor
"""),
("law, crime and order", """
قَضَاء | noun | judiciary; fate
قَضَائِيّ | adj | judicial
نِيَابَة | noun | public prosecution
اِدِّعَاء | noun | claim; prosecution
مُرَافَعَة | noun | pleading (in court)
حَيْثِيَّات | noun | grounds (of a ruling)
سَابِقَة | noun | precedent; previous conviction
بَيِّنَة | noun | evidence, proof
إِثْبَات | noun | proof
نَفْي | noun | denial; exile
إِقْرَار | noun | acknowledgement
تَبْرِئَة | noun | acquittal
إِعْفَاء | noun | exemption; dismissal
عَفْو | noun | pardon, amnesty
تَقَادُم | noun | statute of limitations; ageing
جِنَايَة | noun | felony
جَانٍ | noun | perpetrator
تَوَاطُؤ | noun | collusion
تَسَتُّر | noun | cover-up
تَحَرُّش | noun | harassment
تَشْهِير | noun | defamation
قَذْف | noun | slander
اِنْتِحَال | noun | plagiarism; impersonation
قَرْصَنَة | noun | piracy
غِشّ | noun | cheating, fraud
مُصَادَرَة | noun | confiscation
تَجْمِيد | noun | freezing
إِلْزَام | noun | obligation, binding
سَارٍ | adj | valid, in effect
بَاطِل | adj | void; false
مُلْزِم | adj | binding
جَائِز | adj | permissible
مَحْظُور | adj | prohibited
"""),
("economy, work and wealth", """
تَقَشُّف | noun | austerity
اِنْكِمَاش | noun | contraction, deflation
اِزْدِهَار | noun | prosperity, boom
فُقَاعَة | noun | bubble
مُضَارَبَة | noun | speculation
سُيُولَة | noun | liquidity
جِبَايَة | noun | tax collection
رُسُوم | noun | fees, duties
عُمُولَة | noun | commission
سُلْفَة | noun | advance (of money)
رَهْن | noun | mortgage, pledge
كَفِيل | noun | guarantor, sponsor
تَأْمِين | noun | insurance; securing
مُقَاوَلَة | noun | contracting, contract
مُنَاقَصَة | noun | tender
مَزَاد | noun | auction
ثَرَاء | noun | wealth, affluence
تَرَف | noun | luxury
فَاقَة | noun | destitution
مَعِيشَة | noun | living, livelihood
رِزْق | noun | livelihood, sustenance
قُوت | noun | sustenance, daily bread
كَسْب | noun | earning, gain
مَكْسَب | noun | gain, advantage
غَنِيمَة | noun | spoils, booty
حِرْمَان | noun | deprivation
مَشَقَّة | noun | hardship
عَنَاء | noun | trouble, effort
"""),
("knowledge, science and the mind", """
ذِهْن | noun | mind
ذِهْنِيّ | adj | mental
ذِهْنِيَّة | noun | mentality
لَاوَعْي | noun | the unconscious
بَاطِن | noun | interior, inner self
ظَاهِر | adj | apparent, outward
خَفِيّ | adj | hidden
جَلِيّ | adj | clear, evident
غَمُوض | noun | ambiguity, mystery
فَارِق | noun | difference, distinction
تَفَاوُت | noun | disparity
تَبَايُن | noun | contrast, divergence
تَمَاثُل | noun | similarity, symmetry
تَشَابُه | noun | resemblance
تَنَاظُر | noun | symmetry, correspondence
تَرَابُط | noun | interconnection, coherence
تَمَاسُك | noun | cohesion
تَسَلْسُل | noun | sequence
اِنْسِجَام | noun | harmony
تَوَافُق | noun | compatibility, agreement
تَعْقِيد | noun | complexity
تَبْسِيط | noun | simplification
تَجْرِيد | noun | abstraction
تَعْمِيق | noun | deepening
تَأْصِيل | noun | grounding, rooting
تَوْثِيق | noun | documentation
تَدْقِيق | noun | auditing, scrutiny
تَمْحِيص | noun | close examination
اِسْتِقْصَاء | noun | inquiry, survey
اِسْتِكْشَاف | noun | exploration
نَمُوذَج | noun | model
مُحَاكَاة | noun | simulation; imitation
مُعْطَيَات | noun | data
مُؤَشِّر | noun | indicator
مِقْدَار | noun | amount, quantity
نِسَب | noun | ratios
نَوْعِيّ | adj | qualitative
"""),
("language and literature", """
فَصَاحَة | noun | eloquence
بَدِيع | noun | rhetorical embellishment
مَجَاز | noun | figurative speech
كِنَايَة | noun | metonymy
تَوْرِيَة | noun | double meaning
جِنَاس | noun | paronomasia
سَجْع | noun | rhymed prose
طِبَاق | noun | antithesis
إِيجَاز | noun | concision
لَفْظِيّ | adj | verbal, literal
مَجَازِيّ | adj | figurative
نَحْوِيّ | adj | grammatical
مُعْجَم | noun | lexicon, dictionary
مُرَادِف | noun | synonym
اِشْتِقَاق | noun | derivation, etymology
تَصْرِيف | noun | conjugation, inflection
إِعْرَاب | noun | parsing, case endings
تَشْكِيل | noun | vowelling
مُدَوَّنَة | noun | blog; code (of law)
مَقَامَة | noun | maqama (rhymed prose tale)
سِيرَة | noun | biography
رِثَاء | noun | elegy
هِجَاء | noun | satire, lampoon
غَزَل | noun | love poetry
مَلْحَمَة | noun | epic
خَاطِرَة | noun | reflection, short essay
حِوَار | noun | dialogue
مَشْهَد | noun | scene
"""),
("describing things", """
عَرَضِيّ | adj | incidental, accidental
وَشِيك | adj | imminent
عَسِير | adj | difficult
يَسِير | adj | easy, slight
جَلَل | adj | momentous
وَخِيم | adj | grave, dire
مُرَوِّع | adj | horrific
فَظِيع | adj | dreadful
شَنِيع | adj | heinous
بَشِع | adj | hideous
مُشِين | adj | shameful
مُبْتَذَل | adj | banal, vulgar
رَكِيك | adj | weak, poor (of style)
سَقِيم | adj | sickly; faulty
رَدِيء | adj | poor-quality
عَتِيق | adj | ancient, vintage
بَالٍ | adj | worn out
خَلَّاب | adj | captivating
فَاتِن | adj | charming, enchanting
سَاحِر | adj | magical, enchanting
رَائِق | adj | clear, serene
صَافٍ | adj | pure, clear
عَكِر | adj | murky
قَاحِل | adj | barren
خَصِب | adj | fertile
شَاسِع | adj | vast
فَسِيح | adj | spacious
آهِل | adj | inhabited
مَهْجُور | adj | deserted, abandoned
خَرِب | adj | ruined
عَامِر | adj | flourishing, populated
مُطَّرِد | adj | steady, consistent
مُتَآكِل | adj | eroded
"""),
("connectives and adverbs", """
إِذَّاكَ | adv | at that time
آنَئِذٍ | adv | then
رَيْثَمَا | conj | until, while
رَيْث | noun | delay
رَيْبَ | noun | doubt (in لَا رَيْبَ)
قَاطِبَةً | adv | all, without exception
كَافَّةً | adv | all, entirely
طُرًّا | adv | all, altogether
تِبَاعًا | adv | in succession
صَرَاحَةً | adv | frankly, explicitly
سِرًّا | adv | secretly
عَنْوَةً | adv | by force
طَوْعًا | adv | voluntarily
كَرْهًا | adv | unwillingly
عَبَثًا | adv | in vain
اِعْتِبَاطًا | adv | arbitrarily
بَغْتَةً | adv | suddenly
تَارَةً | adv | at times
حَقِيقَةً | adv | truly
قِيَاسًا | adv | by comparison
تَفْصِيلًا | adv | in detail
"""),
("everyday verbs", """
اِسْتَشْرَفَ | verb | to foresee, look ahead to
اِسْتَقْرَأَ | verb | to infer, investigate
اِسْتَنْبَطَ | verb | to deduce, derive
اِسْتَدَلَّ | verb | to infer, reason
اِسْتَهَانَ | verb | to underestimate, scorn
اِسْتَخَفَّ | verb | to belittle
اِسْتَهْجَنَ | verb | to disapprove of
اِسْتَحْسَنَ | verb | to approve of
اِسْتَبَدَّ | verb | to rule despotically
اِسْتَأْثَرَ | verb | to monopolise, seize
اِسْتَفْحَلَ | verb | to become rampant
اِسْتَعْصَى | verb | to prove intractable
اِسْتَنْفَدَ | verb | to exhaust, use up
اِسْتَدْرَكَ | verb | to correct oneself, make up for
اِسْتَرْسَلَ | verb | to go on (at length)
اِسْتَطْرَدَ | verb | to digress
اِسْتَمَاتَ | verb | to fight to the death
اِسْتَنْهَضَ | verb | to rouse
اِسْتَفَزَّ | verb | to provoke
اِسْتَعْطَفَ | verb | to appeal to the sympathy of
اِسْتَدْرَجَ | verb | to lure
اِسْتَبَاحَ | verb | to violate, treat as fair game
اِسْتَرَدَّ | verb | to recover, get back
اِسْتَوْطَنَ | verb | to settle (in)
اِسْتَقَالَ | verb | to resign
اِحْتَكَمَ | verb | to appeal (to an arbiter)
اِحْتَضَنَ | verb | to embrace; to host
اِحْتَفَى | verb | to celebrate, honour
اِخْتَزَلَ | verb | to reduce, condense
اِخْتَلَقَ | verb | to fabricate
اِدَّعَى | verb | to claim
اِرْتَأَى | verb | to deem, see fit
اِرْتَجَلَ | verb | to improvise
اِزْدَرَى | verb | to scorn
اِغْتَنَمَ | verb | to seize (a chance)
اِفْتَعَلَ | verb | to fabricate, stage
اِفْتَقَرَ | verb | to lack
اِقْتَحَمَ | verb | to storm, break into
اِكْتَنَفَ | verb | to surround, shroud
اِلْتَبَسَ | verb | to be confused, ambiguous
اِمْتَثَلَ | verb | to comply
اِمْتَعَضَ | verb | to resent
اِنْبَثَقَ | verb | to emerge, emanate
اِنْتَزَعَ | verb | to wrest, extract
اِنْحَازَ | verb | to side (with)
اِنْدَثَرَ | verb | to die out, vanish
اِنْزَوَى | verb | to withdraw, retreat
اِنْصَاعَ | verb | to submit, comply
اِنْقَضَى | verb | to elapse, expire
اِنْهَمَكَ | verb | to be absorbed (in)
تَأَمَّلَ | verb | to contemplate
تَأَرْجَحَ | verb | to swing, fluctuate
تَبَلْوَرَ | verb | to take shape
تَبَاهَى | verb | to show off
تَحَاشَى | verb | to shun, avoid
تَحَايَلَ | verb | to get round (a rule)
تَحَسَّرَ | verb | to lament
تَخَبَّطَ | verb | to flounder
تَدَارَكَ | verb | to remedy, head off
تَذَرَّعَ | verb | to use as a pretext
تَرَبَّصَ | verb | to lie in wait
تَرَفَّعَ | verb | to rise above
تَرَنَّحَ | verb | to stagger
تَزَعَّمَ | verb | to lead, head
تَسَلَّلَ | verb | to sneak in, infiltrate
تَشَبَّثَ | verb | to cling (to)
تَصَدَّى | verb | to confront, tackle
تَعَثَّرَ | verb | to stumble
تَعَنَّتَ | verb | to be obstinate
تَغَاضَى | verb | to overlook, turn a blind eye
تَفَاقَمَ | verb | to worsen
تَقَمَّصَ | verb | to assume (a role)
تَلَاشَى | verb | to fade away
تَمَادَى | verb | to persist, go too far
تَمَلَّصَ | verb | to wriggle out
تَنَصَّلَ | verb | to disown, shirk
تَوَارَى | verb | to hide, disappear
تَوَجَّسَ | verb | to have misgivings
تَوَسَّطَ | verb | to mediate
تَوَعَّدَ | verb | to threaten
أَبَاحَ | verb | to permit
أَبْطَلَ | verb | to invalidate
أَجْهَضَ | verb | to abort, foil
أَحْبَطَ | verb | to foil; to frustrate
أَخْمَدَ | verb | to quell, put out
أَذْعَنَ | verb | to yield, submit
أَرْبَكَ | verb | to confuse, unsettle
أَرْسَى | verb | to establish, anchor
أَسْدَى | verb | to render (a service)
أَشْعَرَ | verb | to make aware
أَضْفَى | verb | to lend, confer
أَطَّرَ | verb | to frame
أَعْرَبَ | verb | to express
أَغْفَلَ | verb | to neglect, omit
أَفْصَحَ | verb | to state clearly, disclose
أَقْصَى | verb | to exclude, remove
أَمْعَنَ | verb | to go to great lengths
أَنَاطَ | verb | to entrust
أَوْعَزَ | verb | to instruct, prompt
أَوْهَمَ | verb | to delude
بَدَّدَ | verb | to dispel; to squander
بَطَشَ | verb | to oppress, strike violently
جَسَّدَ | verb | to embody
حَرَّضَ | verb | to incite
حَسَمَ | verb | to settle, decide
حَصَّنَ | verb | to fortify
خَوَّلَ | verb | to authorise
دَسَّ | verb | to slip in, insinuate
دَمَجَ | verb | to merge, integrate
ذَلَّلَ | verb | to overcome (difficulties)
زَعَمَ | verb | to claim, allege
زَعْزَعَ | verb | to shake, destabilise
سَخَّرَ | verb | to harness
شَوَّهَ | verb | to distort, disfigure
صَادَقَ | verb | to ratify
ضَلَّلَ | verb | to mislead
طَمْأَنَ | verb | to reassure
عَرْقَلَ | verb | to obstruct
غَرَّرَ | verb | to deceive, lure
فَاقَمَ | verb | to aggravate
قَوَّضَ | verb | to undermine
كَبَحَ | verb | to curb
لَمَّحَ | verb | to hint
مَحَّصَ | verb | to scrutinise
نَاوَرَ | verb | to manoeuvre
نَبَذَ | verb | to reject, cast off
نَدَبَ | verb | to mourn; to delegate
هَمَّشَ | verb | to marginalise
وَفَّقَ | verb | to reconcile; to grant success
"""),
("more words for the level", """
أُفُق | noun | horizon
ذُرْوَة | noun | climax, peak
حَضِيض | noun | nadir, lowest point
هَاوِيَة | noun | abyss
مُنْعَطَف | noun | turning point; bend
مُفْتَرَق | noun | crossroads
مَعْزِل | noun | isolation
صَمِيم | noun | core, heart
لُبّ | noun | core, kernel
نَوَاة | noun | nucleus; stone (of a fruit)
بُؤْرَة | noun | focus; hotbed
مَهْد | noun | cradle
مَنْشَأ | noun | origin
مَصِير | noun | fate, destiny
قَدَر | noun | fate
نَصِيب | noun | share, lot
مَشِيئَة | noun | will (of God, of a person)
نَذِير | noun | warning, harbinger
بَشِير | noun | herald of good news
فَأْل | noun | omen
بَلَاء | noun | affliction, trial
مُصِيبَة | noun | misfortune
فَاجِعَة | noun | tragedy, disaster
عِظَة | noun | lesson, admonition
مَوْعِظَة | noun | sermon
فَضِيلَة | noun | virtue
رَذِيلَة | noun | vice
خَطِيئَة | noun | sin
إِثْم | noun | wrongdoing, sin
نَقِيصَة | noun | shortcoming
هَفْوَة | noun | slip, lapse
زَلَّة | noun | slip, blunder
سَهْو | noun | oversight
غَفْلَة | noun | heedlessness
سَذَاجَة | noun | naivety
بَرَاعَة | noun | skill, brilliance
مَلَكَة | noun | faculty, aptitude
عَبْقَرِيَّة | noun | genius
نُبُوغ | noun | brilliance
إِبْدَاع | noun | creativity
إِلْهَام | noun | inspiration
خَاطِر | noun | thought, mind
هَاجِس | noun | preoccupation, worry
وَسْوَاس | noun | obsession, whisper
كَابُوس | noun | nightmare
أُمْنِيَة | noun | wish
تَطَلُّع | noun | aspiration
نَزْوَة | noun | whim
رَغْبَة | noun | desire
شَهْوَة | noun | appetite, lust
جَشَع | noun | greed
زُهْد | noun | asceticism
وَرَع | noun | piety
خُشُوع | noun | reverence
تَبْجِيل | noun | veneration
شَعِيرَة | noun | rite
عَزَاء | noun | condolence, consolation
زِفَاف | noun | wedding (ceremony)
مَهْر | noun | dowry
نَسَب | noun | lineage
سُلَالَة | noun | dynasty, lineage; breed
عَشِيرَة | noun | clan
قَبِيلَة | noun | tribe
قَبَلِيّ | adj | tribal
بَدَوِيّ | adj | Bedouin
عُمْرَان | noun | urban development
رِيفِيّ | adj | rural
بِنْيَة | noun | structure
مَرْفِق | noun | facility; elbow
جَبْهَة | noun | front; forehead
خَنْدَق | noun | trench
كَمِين | noun | ambush
غَارَة | noun | raid
قَصْف | noun | bombardment
هُجُوم | noun | attack
اِنْسِحَاب | noun | withdrawal
اِسْتِسْلَام | noun | surrender
ذَخِيرَة | noun | ammunition
عَتَاد | noun | equipment, materiel
أُسْطُول | noun | fleet
كَتِيبَة | noun | battalion
فَيْلَق | noun | corps
مُرْتَزِق | noun | mercenary
أَسِير | noun | prisoner (of war)
شَهِيد | noun | martyr
ضَرِيح | noun | shrine, tomb
مِيزَان | noun | balance, scales
رَوَاج | noun | popularity, brisk trade
وَفْرَة | noun | abundance
غَلَّة | noun | yield, crop
كَوْنِيّ | adj | cosmic
مَجَرَّة | noun | galaxy
نَيْزَك | noun | meteor
مُذَنَّب | noun | comet
كُسُوف | noun | solar eclipse
خُسُوف | noun | lunar eclipse
مَدّ | noun | high tide; extension
جَزْر | noun | low tide, ebb
تَعْرِيَة | noun | erosion
بُرْكَانِيّ | adj | volcanic
مُنَاخِيّ | adj | climatic
اِسْتِوَائِيّ | adj | tropical
قُطْبِيّ | adj | polar
صَحْرَاوِيّ | adj | desert (as an adjective)
سَاحِلِيّ | adj | coastal
جَبَلِيّ | adj | mountainous
بَحْرِيّ | adj | maritime, naval
بَرِّيّ | adj | wild; by land
جَوِّيّ | adj | air (as an adjective)
أَرْضِيّ | adj | terrestrial
فَلَكِيّ | adj | astronomical
مِجْهَر | noun | microscope
مِنْظَار | noun | telescope; binoculars
عَدَسَة | noun | lens
مَغْنَاطِيس | noun | magnet
صَدًى | noun | echo
وَمِيض | noun | flash, gleam
بَرِيق | noun | glitter, lustre
لَمَعَان | noun | shine
شُعَاع | noun | ray, beam
ظِلّ | noun | shadow, shade
عَتْمَة | noun | darkness
سَرَاب | noun | mirage
مُفَارَقَة | noun | paradox, irony
تَهَكُّم | noun | sarcasm
طُرْفَة | noun | anecdote, witticism
أُحْجِيَة | noun | puzzle
نَظْرَة | noun | look, glance
إِطْلَالَة | noun | appearance; view
مَلَامِح | noun | features
سِمَة | noun | trait
خَاصِّيَّة | noun | property, characteristic
تَأَسَّفَ | verb | to regret, be sorry
تَأَهَّبَ | verb | to get ready
تَبَاطَأَ | verb | to slow down
تَحَصَّنَ | verb | to entrench oneself
تَخَلَّفَ | verb | to lag behind; to stay away
تَدَفَّقَ | verb | to flow, pour
تَرَاخَى | verb | to slacken
تَسَامَحَ | verb | to be tolerant
تَصَاعَدَ | verb | to escalate, rise
تَطَوَّعَ | verb | to volunteer
تَعَاقَبَ | verb | to follow one another
تَعَمَّدَ | verb | to do deliberately
تَعَمَّقَ | verb | to go deep (into)
تَغَلْغَلَ | verb | to penetrate
تَفَادَى | verb | to dodge
تَقَاسَمَ | verb | to share out
تَكَبَّدَ | verb | to incur, suffer
تَلَقَّى | verb | to receive
تَمَخَّضَ | verb | to result (in)
تَنَبَّأَ | verb | to predict
تَنَكَّرَ | verb | to disguise oneself; to disown
تَهَاوَى | verb | to collapse
جَابَهَ | verb | to confront
جَازَفَ | verb | to take a risk
حَاصَرَ | verb | to besiege
حَبَّذَ | verb | to favour
حَرَّكَ | verb | to move, stir
حَطَّمَ | verb | to smash
حَلَّقَ | verb | to soar, fly
خَلَّدَ | verb | to immortalise
دَاهَمَ | verb | to raid
دَوَّنَ | verb | to write down, record
ذَاعَ | verb | to spread (of news)
رَاهَنَ | verb | to bet
رَصَدَ | verb | to monitor, observe
رَمَّمَ | verb | to restore
سَاوَمَ | verb | to bargain
سَلَّطَ | verb | to shine (a light on); to impose
شَيَّدَ | verb | to build, erect
صَعَّدَ | verb | to escalate
ضَاهَى | verb | to rival, match
طَمَسَ | verb | to obliterate
عَاتَبَ | verb | to reproach
عَانَى | verb | to suffer
غَمَرَ | verb | to flood, overwhelm
فَنِيَ | verb | to perish
قَاضَى | verb | to sue
كَافَأَ | verb | to reward
لَاذَ | verb | to take refuge
مَاطَلَ | verb | to stall, procrastinate
نَاهَضَ | verb | to resist, oppose
نَبَعَ | verb | to spring, originate
نَهَضَ | verb | to rise, get up
وَاسَى | verb | to console
وَشَى | verb | to inform (on)
يَئِسَ | verb | to despair
هَمَجِيّ | adj | barbaric
وَحْشِيّ | adj | brutal
دَمَوِيّ | adj | bloody
سِلْمِيّ | adj | peaceful
وُدِّيّ | adj | amicable
مُرِيب | adj | suspicious, dubious
بَشُوش | adj | cheerful, smiling
مُتَجَهِّم | adj | sullen
شَاحِب | adj | pale
هَزِيل | adj | emaciated; feeble
بَدِين | adj | stout, obese
رَشِيق | adj | slender, agile
مُمْتَلِئ | adj | full; plump
مُسْتَدِير | adj | round
مُرَبَّع | adj | square
مُسْتَطِيل | noun | rectangle
دَائِرِيّ | adj | circular
مُنْحَنٍ | adj | curved
مُتَعَرِّج | adj | winding
أَمْلَس | adj | smooth
لَزِج | adj | sticky
"""),
]
