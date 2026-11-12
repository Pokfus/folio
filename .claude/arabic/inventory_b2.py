"""The B2 inventory: the words the Arabic B2 deck teaches, on top of the shipped A1, A2 and B1.

Written as `inventory.py` is (read its header: one line a word, `vowelled headword
| part of speech | English`, the English the card's own), for the CEFR B2
descriptor's "complex text on both concrete and abstract topics": argument and
opinion, thought and research, society, law, the economy, politics, science,
medicine, the environment, the media, the arts, and the verbs and connectives of
formal writing a B2 reader meets in a newspaper, a lecture or a report.  There is
still no exam board's list to read (`docs/arabic-decks-plan.md` §2).

A word a shipped lower deck teaches is never a line here (`select.py` stops on
one).  The lower inventories' lines that every lower deck left out are CARRIED
into this level by `select.py` and compete on the same count.
"""

TOPICS = [
("argument and opinion", """
حُجَّة | noun | argument, case
بُرْهَان | noun | proof
جَدَل | noun | debate, controversy
اِعْتِرَاض | noun | objection
تَأْيِيد | noun | support, backing
مُعَارَضَة | noun | opposition
وِجْهَة | noun | direction; point of view
اِنْطِبَاع | noun | impression
اِقْتِرَاح | noun | suggestion, proposal
تَوْصِيَة | noun | recommendation
اِسْتِنْتَاج | noun | conclusion
فَرَضِيَّة | noun | hypothesis
اِفْتِرَاض | noun | assumption
اِحْتِمَال | noun | probability, possibility
شَكّ | noun | doubt
يَقِين | noun | certainty
قَنَاعَة | noun | conviction; contentment
مَبْدَأ | noun | principle
قِيمَة | noun | value
مِعْيَار | noun | standard, criterion
أَوْلَوِيَّة | noun | priority
تَحَفُّظ | noun | reservation
تَنَاقُض | noun | contradiction
اِلْتِبَاس | noun | ambiguity, confusion
تَبْرِير | noun | justification
تَفْسِير | noun | interpretation, explanation
تَقْيِيم | noun | evaluation
نَقْد | noun | criticism
اِنْتِقَاد | noun | criticism (an instance)
مَدْح | noun | praise
تَعْمِيم | noun | generalisation
مُبَالَغَة | noun | exaggeration
تَحَيُّز | noun | bias
مَوْضُوعِيَّة | noun | objectivity
مَوْضُوعِيّ | adj | objective
ذَاتِيّ | adj | subjective; self-
مَنْطِق | noun | logic
مَنْطِقِيّ | adj | logical
مُقْنِع | adj | convincing
مُتَنَاقِض | adj | contradictory
جَوْهَرِيّ | adj | fundamental, essential
ثَانَوِيَّة | noun | secondary school
هَامّ | adj | important (formal)
بَدِيهِيّ | adj | self-evident
نِسْبِيّ | adj | relative
مُطْلَق | adj | absolute
"""),
("thought and knowledge", """
وَعْي | noun | awareness, consciousness
إِدْرَاك | noun | perception, realisation
تَصَوُّر | noun | conception, idea
رُؤْيَة | noun | vision; seeing
بَصِيرَة | noun | insight
حِكْمَة | noun | wisdom
جَهْل | noun | ignorance
تَأَمُّل | noun | contemplation, meditation
تَفْكِير | noun | thinking
اِعْتِقَاد | noun | belief
عَقِيدَة | noun | creed, doctrine
خُرَافَة | noun | superstition
حَدْس | noun | intuition
غَرِيزَة | noun | instinct
دَافِع | noun | motive
نِيَّة | noun | intention
غَايَة | noun | purpose, end; utmost
وَسِيلَة | noun | means
آلِيَّة | noun | mechanism
ظَاهِرَة | noun | phenomenon
عُنْصُر | noun | element
بُعْد | noun | dimension; distance
مِحْوَر | noun | axis; focus
سِيَاق | noun | context
مَضْمُون | noun | content
جَوْهَر | noun | essence
شَكْلِيّ | adj | formal, superficial
مَعْنَوِيّ | adj | moral, abstract
مَادِّيّ | adj | material
نَظَرِيّ | adj | theoretical
عَمَلِيّ | adj | practical
تَجْرِيبِيّ | adj | experimental
عَقْلِيّ | adj | mental, rational
"""),
("society and politics", """
سِيَادَة | noun | sovereignty
دِيمُقْرَاطِيَّة | noun | democracy
اِسْتِبْدَاد | noun | despotism, tyranny
حَلِيف | noun | ally
تَحَالُف | noun | alliance, coalition
اِئْتِلَاف | noun | coalition
إِصْلَاح | noun | reform
تَغْيِير | noun | change
تَنْمِيَة | noun | development
اِسْتِقْرَار | noun | stability
فَوْضَى | noun | chaos
فَسَاد | noun | corruption
رِشْوَة | noun | bribe
شَفَافِيَة | noun | transparency
مُسَاءَلَة | noun | accountability
نُفُوذ | noun | influence
هَيْمَنَة | noun | dominance, hegemony
دِبْلُومَاسِيَّة | noun | diplomacy
دِبْلُومَاسِيّ | adj | diplomatic; a diplomat
سَفِير | noun | ambassador
قِمَّة | noun | summit, peak
مُؤْتَمَر | noun | conference
اِتِّفَاقِيَّة | noun | agreement, convention
عُقُوبَات | noun | sanctions
حِصَار | noun | siege, blockade
نِزَاع | noun | dispute
هُدْنَة | noun | truce
وَقْف | noun | stopping; endowment
اِحْتِلَال | noun | occupation
مُقَاوَمَة | noun | resistance
اِنْقِلَاب | noun | coup; overturning
اِسْتِفْتَاء | noun | referendum
تَصْوِيت | noun | voting
نَاخِب | noun | voter
وَلَايَة | noun | state; term of office
بَلَدِيَّة | noun | municipality
إِقْلِيم | noun | region, province
مَرْكَزِيّ | adj | central
لِيبِرَالِيّ | adj | liberal
مُتَطَرِّف | adj | extremist
شَعْبِيَّة | noun | popularity
مُوَاطَنَة | noun | citizenship
اِنْدِمَاج | noun | integration; merger
تَمْيِيز | noun | discrimination; distinction
عُنْصُرِيَّة | noun | racism
تَسَامُح | noun | tolerance
تَعَايُش | noun | coexistence
تَضَامُن | noun | solidarity
رَفَاهِيَة | noun | welfare, prosperity
"""),
("law and rights", """
تَشْرِيع | noun | legislation
مَرْسُوم | noun | decree
لَائِحَة | noun | regulation; list
بَنْد | noun | clause, item
مُحَاكَمَة | noun | trial
دَعْوَى | noun | lawsuit
مُدَّعٍ | noun | plaintiff; prosecutor
دِفَاع | noun | defence
حُكْم | noun | verdict; rule
اِسْتِئْنَاف | noun | appeal; resumption
بَرَاءَة | noun | innocence; patent
بَرِيء | adj | innocent
مُذْنِب | adj | guilty
اِعْتِرَاف | noun | confession; recognition
مُخَالِف | adj | contrary; an offender
اِنْتِهَاك | noun | violation
كَرَامَة | noun | dignity
خُصُوصِيّ | adj | private
تَعْوِيض | noun | compensation
مِلْكِيَّة | noun | ownership, property
وَرَثَة | noun | heirs
مِيرَاث | noun | inheritance
وَصِيَّة | noun | will; commandment
تَزْوِير | noun | forgery
اِخْتِلَاس | noun | embezzlement
تَهْرِيب | noun | smuggling
اِعْتِقَال | noun | arrest, detention
كَفَالَة | noun | bail; sponsorship
مُرَاقَبَة | noun | surveillance, monitoring
"""),
("the economy and business", """
نُمُوّ | noun | growth
رُكُود | noun | recession, stagnation
اِنْتِعَاش | noun | recovery, revival
اِحْتِكَار | noun | monopoly
قِطَاع | noun | sector
تَصْدِير | noun | export, exporting
اِسْتِيرَاد | noun | import, importing
جُمْرُكِيّ | adj | customs (as an adjective)
عَجْز | noun | deficit; inability
فَائِض | noun | surplus
سَنَد | noun | bond; support
سَهْم | noun | share; arrow
بُورْصَة | noun | stock exchange
مُسْتَثْمِر | noun | investor
رَأْس مَال | noun | capital
أُصُول | noun | assets; origins
أَرْبَاح | noun | profits
عَائِد | noun | return, yield
إِفْلَاس | noun | bankruptcy
مُوَازَنَة | noun | budget; balancing
تَمْوِيل | noun | financing
دَعْم | noun | support; subsidy
قُرُوض | noun | loans
مَصْرِفِيّ | adj | banking
مَالِيّ | adj | financial
نَقْدِيّ | adj | monetary; cash
تِجَارِيّ | adj | commercial
شَرِيك | noun | partner
حِصَّة | noun | share, portion; lesson
اِسْتِهْلَاك | noun | consumption
كُلْفَة | noun | cost
"""),
("work and organisations", """
هَيْكَل | noun | structure; skeleton
هَيْئَة | noun | body, authority; appearance
لَجْنَة | noun | committee
مَجْلِس | noun | council
إِدَارِيّ | adj | administrative
تَعْيِين | noun | appointment
تَكْلِيف | noun | assignment
مَسْؤُولِيَّة | noun | responsibility
صَلَاحِيَّة | noun | authority, competence; validity
قِيَادَة | noun | leadership; driving
قَائِد | noun | leader
إِشْرَاف | noun | supervision
تَنْسِيق | noun | coordination
تَخْطِيط | noun | planning
أَدَاء | noun | performance
مُتَابَعَة | noun | follow-up
حَافِز | noun | incentive
مُكَافَأَة | noun | reward, bonus
عِلَاوَة | noun | allowance, raise
أَجْر | noun | wage, pay
حِرْفَة | noun | craft, trade
حِرَفِيّ | noun | craftsman
هَاوٍ | noun | amateur
"""),
("science and research", """
بَاحِث | noun | researcher
عَالِم | noun | scientist, scholar
عَيِّنَة | noun | sample
بَيَانَات | noun | data
إِحْصَاء | noun | statistics; census
إِحْصَائِيّ | adj | statistical
مُعَدَّل | noun | rate, average
مِقْيَاس | noun | scale, measure
قِيَاس | noun | measurement; analogy
دِقَّة | noun | precision, accuracy
مُتَغَيِّر | noun | variable
مُعَادَلَة | noun | equation
رَقْم قِيَاسِيّ | noun | record
ذَرَّة | noun | atom
جُزَيْء | noun | molecule
خَلِيَّة | noun | cell
جِين | noun | gene
كَائِن | noun | being, creature
فِيزِيَائِيّ | adj | physical; a physicist
كِيمْيَائِيّ | adj | chemical; a chemist
بِيُولُوجِيّ | adj | biological
فَلَك | noun | orbit; astronomy
كَوْكَبِيّ | adj | planetary
مَدَار | noun | orbit; tropic
جَاذِبِيَّة | noun | gravity; attractiveness
ضَوْئِيّ | adj | optical, light (as an adjective)
إِشْعَاع | noun | radiation
نَوَوِيّ | adj | nuclear
كَهْرُومَغْنَاطِيسِيّ | adj | electromagnetic
مُخْتَصّ | adj | specialised; a specialist
تَخْصِيص | noun | allocation
نَشْر | noun | publication; spreading
اِبْتِكَار | noun | innovation
"""),
("technology and the internet", """
تِكْنُولُوجِيَا | noun | technology
تِقْنِيّ | adj | technical
بَرْمَجَة | noun | programming
مُبَرْمِج | noun | programmer
خَوَارِزْمِيَّة | noun | algorithm
شِيفْرَة | noun | code, cipher
قَاعِدَة بَيَانَات | noun | database
خَادِم | noun | server; servant
سَحَابَة | noun | cloud
تَخْزِين | noun | storage
وَاجِهَة | noun | interface; facade
مَنَصَّة | noun | platform
شَبَكَة اجْتِمَاعِيَّة | noun | social network
مُتَصَفِّح | noun | browser
مُحَرِّك بَحْث | noun | search engine
اِخْتِرَاق | noun | hacking; breakthrough
قُرْصَان | noun | pirate; hacker
اِفْتِرَاضِيّ | adj | virtual; default
رُوبُوت | noun | robot
لَاسِلْكِيّ | adj | wireless
إِلِكْتُرُونِيَّات | noun | electronics
"""),
("health and medicine", """
طِبّ | noun | medicine (the science)
طِبِّيّ | adj | medical
تَشْخِيص | noun | diagnosis
عَارِض | noun | symptom
أَعْرَاض | noun | symptoms
مُزْمِن | adj | chronic
مُعْدٍ | adj | infectious
وَبَاء | noun | epidemic
جَائِحَة | noun | pandemic
مَنَاعَة | noun | immunity
مُضَادّ حَيَوِيّ | noun | antibiotic
جُرْعَة | noun | dose
مُسَكِّن | noun | painkiller
تَخْدِير | noun | anaesthesia
وِلَادَة قَيْصَرِيَّة | noun | caesarean section
حَمْل | noun | pregnancy
إِجْهَاض | noun | miscarriage; abortion
عُقْم | noun | infertility
سُمْنَة | noun | obesity
سُكَّرِيّ | noun | diabetes
ضَغْط الدَّم | noun | blood pressure
نَوْبَة | noun | attack, fit; turn
خَرَف | noun | dementia
مُعَالَجَة | noun | treatment, processing
مُمَرِّضَة | noun | nurse (a woman)
صَيْدَلِيّ | noun | pharmacist
"""),
("the environment", """
كَرْبُون | noun | carbon
رِيَاح | noun | winds
تَصَحُّر | noun | desertification
إِزَالَة | noun | removal
غَابَات | noun | forests
تَنَوُّع | noun | diversity
مَوْطِن | noun | habitat; homeland
مَحْمِيَّة | noun | nature reserve
اِسْتِدَامَة | noun | sustainability
تَرْشِيد | noun | rationalising, sparing use
هَدْر | noun | waste, squandering
نُدْرَة | noun | scarcity
مَجَاعَة | noun | famine
سَدّ | noun | dam
رَيّ | noun | irrigation
مَحْصُول | noun | crop, yield
عُضْوِيّ | adj | organic
"""),
("the media", """
صَحَفِيّ | adj | journalistic
تَحْرِير | noun | editing; liberation
مُحَرِّر | noun | editor
افْتِتَاحِيَّة | noun | editorial
عَمُود | noun | column; pillar
تَغْطِيَة | noun | coverage
مَوْثُوق | adj | reliable
مِصْدَاقِيَّة | noun | credibility
تَضْلِيل | noun | misleading, disinformation
اِسْتِطْلَاع | noun | survey, poll
بَيَان | noun | statement
تَصْرِيح | noun | statement; permit
نَاطِق | noun | spokesperson
مُتَحَدِّث | noun | speaker, spokesperson
فَضِيحَة | noun | scandal
شَائِعَة | noun | rumour
"""),
("culture, the arts and literature", """
أَدِيب | noun | man of letters, writer
نَاقِد | noun | critic
شِعْرِيّ | adj | poetic
نَثْر | noun | prose
قَافِيَة | noun | rhyme
سَرْد | noun | narration
رَاوٍ | noun | narrator
بَطَلَة | noun | heroine
خَاتِمَة | noun | conclusion, ending
مُقَدِّمَة | noun | introduction
تُحْفَة | noun | masterpiece
فَنِّيّ | adj | artistic; technical
حَدَاثَة | noun | modernity
مُعَاصَرَة | noun | contemporaneity
رَمْز | noun | symbol
رَمْزِيّ | adj | symbolic
اِسْتِعَارَة | noun | metaphor
تَشْبِيه | noun | simile
بَلَاغَة | noun | eloquence, rhetoric
فَصِيح | adj | eloquent; standard (of Arabic)
فُصْحَى | noun | Modern Standard Arabic
عَامِّيَّة | noun | colloquial Arabic
مَخْطُوطَة | noun | manuscript
فُلُكْلُور | noun | folklore
خَطَّاط | noun | calligrapher
زَخْرَفَة | noun | ornament, decoration
مِعْمَارِيّ | adj | architectural; an architect
نَحْت | noun | sculpture
أُوبِرَا | noun | opera
إِيقَاع | noun | rhythm
"""),
("education", """
أَكَادِيمِيّ | adj | academic
مُشْرِف | noun | supervisor
نَدْوَة | noun | seminar, symposium
وَرْشَة | noun | workshop
تَقْدِير | noun | grade; appreciation
تَفَوُّق | noun | excellence
مُتَفَوِّق | adj | outstanding
مَوْهِبَة | noun | talent
مَوْهُوب | adj | gifted
أُمِّيَّة | noun | illiteracy
"""),
("history and religion", """
إِمْبِرَاطُورِيَّة | noun | empire
إِمْبِرَاطُور | noun | emperor
خِلَافَة | noun | caliphate; succession
خَلِيفَة | noun | caliph; successor
فَتْح | noun | conquest; opening
غَزْو | noun | invasion
مَعْرَكَة | noun | battle
نَصْر | noun | victory
اِنْتِصَار | noun | triumph
اِنْهِيَار | noun | collapse
سُقُوط | noun | fall
نَهْضَة | noun | renaissance, revival
مُؤَرِّخ | noun | historian
عِبَادَة | noun | worship
صَلَاة | noun | prayer
صَوْم | noun | fasting
حَجّ | noun | pilgrimage (to Mecca)
زَكَاة | noun | alms
إِيمَان | noun | faith
مُؤْمِن | noun | believer
مُلْحِد | noun | atheist
طَائِفَة | noun | sect, community
مَذْهَب | noun | school (of thought), doctrine
قُدْسِيَّة | noun | sanctity
مُقَدَّس | adj | holy
"""),
("emotions and relationships", """
مَشَاعِر | noun | feelings
تَعَاطُف | noun | sympathy, empathy
شَفَقَة | noun | pity
حَسَد | noun | envy
اِمْتِنَان | noun | gratitude
اِسْتِيَاء | noun | resentment, displeasure
نَدَم | noun | regret
ذَنْب | noun | guilt; sin
خِزْي | noun | disgrace, shame
عَار | noun | shame
تَوَاضُع | noun | modesty
إِعْجَاب | noun | admiration
اِحْتِقَار | noun | contempt
نُفُور | noun | aversion
اِرْتِبَاك | noun | confusion, embarrassment
ذُعْر | noun | panic
طُمَأْنِينَة | noun | peace of mind
سَكِينَة | noun | tranquillity
وَفَاء | noun | loyalty
خِيَانَة | noun | betrayal
إِخْلَاص | noun | sincerity, devotion
وُدّ | noun | affection
أُلْفَة | noun | familiarity, intimacy
اِنْفِصَال | noun | separation, break-up
"""),
("character and behaviour", """
سُلُوك | noun | behaviour
تَصَرُّف | noun | conduct, action
اِنْضِبَاط | noun | discipline
مُهْمِل | adj | careless, negligent
مُتَسَرِّع | adj | hasty
مُتَرَدِّد | adj | hesitant
طَمُوح | adj | ambitious
طُمُوح | noun | ambition
جَشِع | adj | greedy
بَخِيل | adj | stingy
مُبَذِّر | adj | wasteful, spendthrift
شَهْم | adj | gallant, chivalrous
نَزِيه | adj | honest, impartial
مُنَافِق | adj | hypocritical; a hypocrite
مُسَالِم | adj | peaceable
فُضُولِيّ | adj | curious, nosy
مُتَعَجْرِف | adj | haughty
مُتَسَامِح | adj | tolerant
مُتَعَصِّب | adj | fanatical
مُسْتَقِيم | adj | upright; straight
فَظّ | adj | rude, coarse
مُرْهَف | adj | sensitive, refined
"""),
("describing things", """
مُعْتَبَر | adj | considerable
مَلْحُوظ | adj | noticeable, marked
جُزْئِيّ | adj | partial
كُلِّيّ | adj | total
مُتَزَايِد | adj | increasing
مُتَنَاقِص | adj | decreasing
مُتَوَاصِل | adj | continuous, uninterrupted
اِسْتِثْنَائِيّ | adj | exceptional
نَمُوذَجِيّ | adj | model, ideal
مِثَالِيّ | adj | ideal, perfect
بَدِيل | adj | alternative; a substitute
مُعَادِل | adj | equivalent
مُمَاثِل | adj | similar
مُتَوَازِن | adj | balanced
عَشْوَائِيّ | adj | random
مُنَظَّم | adj | organised
وَاقِعِيّ | adj | realistic
خَيَالِيّ | adj | imaginary, fantastic
تَافِه | adj | trivial
جَسِيم | adj | serious, grave
حَاسِم | adj | decisive
حَرِج | adj | critical, awkward
عَاجِل | adj | urgent
مَشْرُوط | adj | conditional
إِلْزَامِيّ | adj | compulsory
اِخْتِيَارِيّ | adj | optional
مَجَّانًا | adv | free of charge
عَلَنِيّ | adj | public, open
سِرِّيّ | adj | secret, confidential
ضِمْنِيّ | adj | implicit
صَرِيح | adj | explicit, frank
مُبْهَم | adj | vague
مُفَصَّل | adj | detailed
مُوجَز | adj | brief, concise
شَائِك | adj | thorny
فَعَّالِيَّة | noun | effectiveness
زَهِيد | adj | cheap, paltry
بَاهِظ | adj | exorbitant
فَاخِر | adj | luxurious
"""),
("connectives and adverbs", """
بَيْدَ | particle | however, but
إِثْرَ | prep | following, after
عَقِبَ | prep | immediately after
إِزَاءَ | prep | regarding, opposite
بِنَاءً | adv | based (on)
حَيَالَ | prep | regarding, towards
شَأْن | noun | matter, affair
جَرَّاءَ | prep | as a result of
لَا سِيَّمَا | adv | especially, in particular
إِجْمَالًا | adv | in total, overall
حَدّ | noun | limit; edge
بِالكَادِ | adv | hardly, barely
فِعْلِيّ | adj | actual
مُؤَقَّتًا | adv | temporarily
بِتَاتًا | adv | absolutely not
قَطْعًا | adv | definitely, absolutely
حَتْمًا | adv | inevitably
آنِفًا | adv | aforementioned, above
مُجَدَّدًا | adv | anew, again
سَوَاء | noun | equal; whether
مِمَّا | conj | which (referring to a clause)
فِيمَا | conj | while, whereas
كَيْفَمَا | conj | however, in whatever way
"""),
("everyday verbs", """
اِسْتَعْرَضَ | verb | to review, survey
اِسْتَوْعَبَ | verb | to grasp, absorb
اِسْتَشَارَ | verb | to consult
اِسْتَشْهَدَ | verb | to cite; to be martyred
اِسْتَدْعَى | verb | to summon; to require
اِسْتَهْدَفَ | verb | to target
اِسْتَنَدَ | verb | to rely, be based (on)
اِسْتَغَلَّ | verb | to exploit, make use of
اِسْتَوْرَدَ | verb | to import
صَدَّرَ | verb | to export
اِسْتَهْلَكَ | verb | to consume
اِسْتَخْلَصَ | verb | to extract, draw (a lesson)
اِسْتَبْعَدَ | verb | to rule out, exclude
اِسْتَأْنَفَ | verb | to resume; to appeal
اِسْتَقْطَبَ | verb | to attract, polarise
اِسْتَنْكَرَ | verb | to denounce
اِسْتَجَابَ | verb | to respond
اِسْتَحَقَّ | verb | to deserve
اِسْتَغْنَى | verb | to do without
اِسْتَمَدَّ | verb | to derive
اِعْتَبَرَ | verb | to consider, regard
اِعْتَرَضَ | verb | to object
اِعْتَدَى | verb | to assault, attack
اِقْتَصَرَ | verb | to be limited (to)
اِقْتَضَى | verb | to require, call for
اِلْتَزَمَ | verb | to commit, abide by
اِنْتَهَكَ | verb | to violate
اِنْعَكَسَ | verb | to be reflected
عَكَسَ | verb | to reflect; to reverse
اِنْدَلَعَ | verb | to break out
اِنْطَلَقَ | verb | to set off, be launched
اِنْخَرَطَ | verb | to get involved
اِرْتَبَطَ | verb | to be connected
اِرْتَكَبَ | verb | to commit (an offence)
اِتَّسَمَ | verb | to be characterised
اِتَّسَعَ | verb | to widen, expand
اِخْتَصَرَ | verb | to abbreviate, sum up
اِحْتَكَرَ | verb | to monopolise
اِحْتَلَّ | verb | to occupy
اِسْتَعْمَرَ | verb | to colonise
تَبَنَّى | verb | to adopt
تَجَاوَزَ | verb | to exceed, overcome
تَحَدَّى | verb | to challenge
حَرَّرَ | verb | to free; to edit
تَحَوَّلَ | verb | to turn (into), change
حَوَّلَ | verb | to transform; to transfer
تَدَخَّلَ | verb | to intervene
تَدَهْوَرَ | verb | to deteriorate
تَرَاكَمَ | verb | to accumulate
رَكَّزَ | verb | to focus, concentrate
تَزَايَدَ | verb | to increase steadily
تَضَاءَلَ | verb | to dwindle
تَضَمَّنَ | verb | to include, involve
تَعَرَّضَ | verb | to be exposed (to)
تَعَهَّدَ | verb | to pledge
تَفَاوَضَ | verb | to negotiate
تَفَوَّقَ | verb | to excel, surpass
تَكَيَّفَ | verb | to adapt
تَمَيَّزَ | verb | to be distinguished
مَيَّزَ | verb | to distinguish
تَنَاوَبَ | verb | to take turns
تَوَازَنَ | verb | to be balanced
تَوَلَّى | verb | to take over, assume
أَجْرَى | verb | to conduct, carry out
أَحْدَثَ | verb | to bring about
أَخَلَّ | verb | to breach
أَدَانَ | verb | to condemn; to convict
أَطْلَعَ | verb | to inform
اِطَّلَعَ | verb | to look into, peruse
أَفَادَ | verb | to benefit; to report
أَقَرَّ | verb | to approve; to acknowledge
أَلْزَمَ | verb | to oblige
أَنْشَأَ | verb | to establish, create
أَوْلَى | verb | to give (attention)
بَرْهَنَ | verb | to prove, demonstrate
بَلْوَرَ | verb | to crystallise
حَثَّ | verb | to urge
حَرَمَ | verb | to deprive
حَظَرَ | verb | to ban
حَفَّزَ | verb | to motivate
حَلَّلَ | verb | to analyse
خَفَّضَ | verb | to lower, cut
رَفَعَ | verb | to raise
رَجَّحَ | verb | to consider likely
رَسَّخَ | verb | to consolidate
سَادَ | verb | to prevail
سَعَى | verb | to strive, seek
شَكَّلَ | verb | to form, constitute
صَاغَ | verb | to formulate
صَنَّفَ | verb | to classify
ضَاعَفَ | verb | to double, multiply
عَزَّزَ | verb | to strengthen
عَطَّلَ | verb | to disrupt, disable
عَمَّمَ | verb | to generalise
عَيَّنَ | verb | to appoint
فَرَضَ | verb | to impose
فَنَّدَ | verb | to refute
قَيَّدَ | verb | to restrict
قَيَّمَ | verb | to evaluate
كَرَّسَ | verb | to dedicate
لَخَّصَ | verb | to summarise
مَوَّلَ | verb | to finance
نَاشَدَ | verb | to appeal (to)
نَسَّقَ | verb | to coordinate
نَوَّهَ | verb | to point out
هَدَفَ | verb | to aim
وَثَّقَ | verb | to document
وَسَّعَ | verb | to expand
وَاكَبَ | verb | to keep pace with
يَسَّرَ | verb | to facilitate
أَوْفَى | verb | to fulfil
تَطَرَّقَ | verb | to touch on (a subject)
نَصَّ | verb | to stipulate
تَبَيَّنَ | verb | to become clear
بَيَّنَ | verb | to show, make clear
أَبْرَزَ | verb | to highlight
أَبْدَى | verb | to express, show
أَثَارَ | verb | to raise, provoke
أَسْفَرَ | verb | to result (in)
أَشَادَ | verb | to praise, commend
أَيَّدَ | verb | to support
تَظَاهَرَ | verb | to demonstrate; to pretend
اِحْتَشَدَ | verb | to gather, rally
تَمَرَّدَ | verb | to rebel
قَمَعَ | verb | to suppress
أَطَاحَ | verb | to overthrow
خَلَفَ | verb | to succeed (someone)
وَرِثَ | verb | to inherit
نَجَا | verb | to survive, escape
اِنْقَرَضَ | verb | to become extinct
لَوَّثَ | verb | to pollute
أَهْدَرَ | verb | to waste
اِسْتَنْزَفَ | verb | to drain, deplete
جَفَّ | verb | to dry up
تَآكَلَ | verb | to erode
شَخَّصَ | verb | to diagnose
عَافَى | verb | to heal
تَعَافَى | verb | to recover
تَفَشَّى | verb | to spread (of a disease)
وَقَى | verb | to protect, prevent
أَدْمَنَ | verb | to become addicted
"""),
("more words for the level", """
عِبْء | noun | burden
قَيْد | noun | restriction; shackle
شَرْط | noun | condition
ضَرَر | noun | harm, damage
نَفْع | noun | benefit, use
عَيْب | noun | defect, fault
مِيزَة | noun | advantage, feature
نُقْطَة | noun | point; dot
مَدًى | noun | range, extent
نِطَاق | noun | scope, range
أَسَاس | noun | basis, foundation
ثَغْرَة | noun | gap, loophole
عَقَبَة | noun | obstacle
مَأْزِق | noun | predicament
مِحْنَة | noun | ordeal
نَكْبَة | noun | catastrophe
ضَحِيَّة | noun | victim
عُنْف | noun | violence
إِرْهَاب | noun | terrorism
رَهِينَة | noun | hostage
ضَمِير | noun | conscience; pronoun
شَرَف | noun | honour
سُمْعَة | noun | reputation
هَيْبَة | noun | prestige, awe
مَكَانَة | noun | standing, status
مَنْصِب | noun | post, position
رُتْبَة | noun | rank
لَقَب | noun | title; surname
إِرْث | noun | legacy, heritage
عُرْف | noun | custom, convention
مَأْسَاة | noun | tragedy
سُخْرِيَة | noun | mockery, irony
فُكَاهَة | noun | humour
نُكْتَة | noun | joke
لُغْز | noun | riddle, mystery
عِبْرَة | noun | lesson (to learn from)
مَثَل | noun | proverb; example
تَعْبِير | noun | expression
صِيغَة | noun | wording, form
لَفْظ | noun | utterance, word
دَلَالَة | noun | significance, indication
وُجُود | noun | existence, presence
كِيَان | noun | entity
اِنْتِمَاء | noun | belonging
وَلَاء | noun | allegiance
حَنِين | noun | nostalgia, yearning
عُزْلَة | noun | isolation
تَهْمِيش | noun | marginalisation
إِقْصَاء | noun | exclusion
مُشَارَكَة | noun | participation
مُبَادَرَة | noun | initiative
مُحَاوَلَة | noun | attempt
سَعْي | noun | pursuit, striving
كِفَاح | noun | struggle
نِضَال | noun | militant struggle
فَشَل | noun | failure
صُمُود | noun | steadfastness
إِرَادَة | noun | will
عَزِيمَة | noun | determination
إِصْرَار | noun | insistence, persistence
عَدَم | noun | lack, absence
سَاحِل | noun | coast
ضِفَّة | noun | bank (of a river)
هَضْبَة | noun | plateau
وَاحَة | noun | oasis
مَنْبَع | noun | source (of a river)
مَصَبّ | noun | mouth (of a river)
خَلِيج | noun | gulf, bay
مَضِيق | noun | strait
سَفْح | noun | foot (of a mountain)
مُنْحَدَر | noun | slope
كَهْف | noun | cave
مُسْتَنْقَع | noun | swamp
بِرْكَة | noun | pond, pool
يَنْبُوع | noun | spring (of water)
مَتِين | adj | solid, sturdy
هَشّ | adj | fragile
صُلْب | adj | hard, solid
شَفَّاف | adj | transparent
كَثِيف | adj | dense
حَيَوِيّ | adj | vital
عَصِيب | adj | hard, trying (of times)
قَاتِم | adj | dark, sombre
بَائِس | adj | miserable
تَعِيس | adj | unhappy
نَبِيل | adj | noble
بَارِع | adj | brilliant, skilled
عَبْقَرِيّ | adj | genius; a genius
أَحْمَق | adj | foolish
سَاذَج | adj | naive
خَبِيث | adj | malicious
مَاكِر | adj | cunning
وَقِح | adj | impudent
جَرِيء | adj | bold
جَبَان | adj | cowardly
مُكْتَئِب | adj | depressed
مُطْمَئِنّ | adj | reassured
سَطْحِيّ | adj | superficial
عَرِيق | adj | long-established
أَصِيل | adj | authentic, pure-bred
زَائِف | adj | false, fake
غَزَا | verb | to invade
نَهَبَ | verb | to loot
سَلَبَ | verb | to rob, strip
طَالَبَ | verb | to demand
عَزَمَ | verb | to resolve, determine
أَقْدَمَ | verb | to venture, undertake
خَشِيَ | verb | to fear
أَنْكَرَ | verb | to deny (a fact)
نَفَى | verb | to deny; to exile
لَامَ | verb | to blame
وَبَّخَ | verb | to scold
أَهَانَ | verb | to humiliate
اِحْتَقَرَ | verb | to despise
تَوَسَّلَ | verb | to beg, plead
اِلْتَمَسَ | verb | to request, seek
اِسْتَأْذَنَ | verb | to ask permission
أَذِنَ | verb | to permit
أَجَازَ | verb | to approve, authorise
وَقَّعَ | verb | to sign
أَبْرَمَ | verb | to conclude (a deal)
فَسَخَ | verb | to annul, cancel
نَقَضَ | verb | to break (a promise), overturn
خَرَقَ | verb | to breach, pierce
أَلْحَقَ | verb | to inflict; to attach
عَوَّضَ | verb | to compensate
صَادَرَ | verb | to confiscate
اِعْتَقَلَ | verb | to arrest
سَجَنَ | verb | to imprison
أَفْرَجَ | verb | to release (a prisoner)
بَرَّأَ | verb | to acquit
شَهِدَ | verb | to witness, testify
حَلَفَ | verb | to swear (an oath)
اِقْتَرَضَ | verb | to borrow (money)
أَقْرَضَ | verb | to lend (money)
سَدَّدَ | verb | to pay off, settle
اِدَّخَرَ | verb | to save up
أَفْلَسَ | verb | to go bankrupt
تَاجَرَ | verb | to trade, deal
أَجَّرَ | verb | to rent out
اِحْتَاطَ | verb | to take precautions
"""),
]
