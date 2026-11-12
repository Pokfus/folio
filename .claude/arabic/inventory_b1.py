"""The B1 inventory: the words the Arabic B1 deck teaches, on top of the shipped A1 and A2.

Written as `inventory.py` is (read its header: one line a word, `vowelled headword
| part of speech | English`, the English the card's own), for the CEFR B1
descriptor's "familiar matters regularly encountered in work, school, leisure":
work and money, study, travel, health, the home, the media and technology,
society and the law, the environment, culture, and the abstract words — feelings,
character, the verbs of thinking and doing, the connectives — a B1 reader meets
in a newspaper or a conversation.  There is still no exam board's list to read
(`docs/arabic-decks-plan.md` §2).

A word a shipped lower deck teaches is never a line here (`select.py` stops on
one).  The lower inventories' lines that their decks left out as less frequent
(A2 dealt 600 of 789) are CARRIED into this level by `select.py` and compete
with these lines on the same count, so a word is never lost between levels.
"""

TOPICS = [
("feelings and character", """
قَلَق | noun | worry, anxiety
رَاحَة | noun | rest; comfort
اِرْتِيَاح | noun | relief
دَهْشَة | noun | astonishment
مُفَاجَأَة | noun | surprise
خَيْبَة | noun | disappointment
غَيْرَة | noun | jealousy
كَرَاهِيَة | noun | hatred
عَاطِفَة | noun | emotion
إِحْسَاس | noun | sense, sensation
حَنَان | noun | tenderness
شَوْق | noun | longing
وَحْدَة | noun | loneliness; unit; unity
خَجَل | noun | shyness, embarrassment
فَخْر | noun | pride
شَجَاعَة | noun | courage
ذَكَاء | noun | intelligence
غَبَاء | noun | stupidity
أَخْلَاق | noun | morals, character
صِفَة | noun | quality, characteristic
شَخْصِيَّة | noun | personality; a character
طَبْع | noun | nature, temperament
مِزَاج | noun | mood
حَمَاس | noun | enthusiasm
تَوَتُّر | noun | tension, stress
ضَغْط | noun | pressure
اِكْتِئَاب | noun | depression
مُتَحَمِّس | adj | enthusiastic, keen
مُتَوَتِّر | adj | tense, stressed
مُعْجَب | adj | impressed; a fan
فَخُور | adj | proud
غَيُور | adj | jealous
أَنَانِيّ | adj | selfish
مُتَوَاضِع | adj | modest
مَغْرُور | adj | conceited, arrogant
صَبُور | adj | patient
عَنِيد | adj | stubborn
حَسَّاس | adj | sensitive
مُخْلِص | adj | loyal, sincere
أَمِين | adj | trustworthy
وَفِيّ | adj | faithful
لَئِيم | adj | mean, nasty
حَكِيم | adj | wise
مَاهِر | adj | skilful
مُبْدِع | adj | creative
جَادّ | adj | earnest, hard-working
مَرِح | adj | cheerful
حَنُون | adj | affectionate, tender
وَدُود | adj | friendly
عَدُوّ | noun | enemy
مُنَافِس | noun | competitor, rival
"""),
("people and relationships", """
خَطِيب | noun | fiancé; preacher
طَلَاق | noun | divorce
مُطَلَّق | adj | divorced
أَرْمَل | noun | widower
يَتِيم | noun | orphan
تَرْبِيَة | noun | upbringing
جَنَازَة | noun | funeral
قَبْر | noun | grave
مُرَاهِق | noun | teenager
مُرَاهَقَة | noun | adolescence
شَيْخُوخَة | noun | old age
بَالِغ | adj | adult; extreme
صَدَاقَة | noun | friendship
خِلَاف | noun | disagreement
شِجَار | noun | quarrel
تَعَاوُن | noun | cooperation
اِتِّفَاق | noun | agreement
وَعْد | noun | promise
اِعْتِذَار | noun | apology
نَصِيحَة | noun | advice
طَلَب | noun | request; order
شَكْوَى | noun | complaint
"""),
("describing people", """
أَشْقَر | adj | blond
أَسْمَر | adj | brown-skinned, dark
أَصْلَع | adj | bald
أَصَمّ | adj | deaf
أَخْرَس | adj | mute
أَعْرَج | adj | lame
مُسِنّ | adj | elderly
مَيِّت | adj | dead
"""),
("work and jobs", """
مِهَنِيّ | adj | professional
تَوْظِيف | noun | employment, hiring
بَطَالَة | noun | unemployment
عَاطِل | adj | unemployed
تَدْرِيب | noun | training
تَرْقِيَة | noun | promotion
اِسْتِقَالَة | noun | resignation
تَقَاعُد | noun | retirement
مُتَقَاعِد | adj | retired
أُجْرَة | noun | fare; wage
دَخْل | noun | income
ضَرِيبَة | noun | tax
مِيزَانِيَّة | noun | budget
رِبْح | noun | profit
خَسَارَة | noun | loss
تَكْلِفَة | noun | expense, cost (of doing)
قَرْض | noun | loan
دَيْن | noun | debt
اِسْتِثْمَار | noun | investment
إِدَارَة | noun | administration, management
فَرْع | noun | branch
مُؤَسَّسَة | noun | institution, foundation
مُنَظَّمَة | noun | organisation (a body)
مُسَاعِد | noun | assistant
سِكْرِتِير | noun | secretary
مُسْتَشَار | noun | adviser, consultant
خَبِير | noun | expert
مُتَخَصِّص | adj | specialised; a specialist
اِخْتِصَاص | noun | speciality, field
عَمِيل | noun | client; agent
مُنْتَج | noun | product
إِنْتَاج | noun | production
تَسْوِيق | noun | marketing
صَفْقَة | noun | deal
مُفَاوَضَة | noun | negotiation
تَقْرِير | noun | report
وَثِيقَة | noun | document
اِسْتِمَارَة | noun | form (to fill in)
تَوْقِيع | noun | signature
جَدْوَل | noun | table, timetable
مُهِمَّة | noun | task, mission
إِنْجَاز | noun | achievement
جُهْد | noun | effort
كَفَاءَة | noun | competence, efficiency
نَشَاط | noun | activity
مُنَافَسَة | noun | competition
نِقَابَة | noun | trade union
إِضْرَاب | noun | strike
مَصْلَحَة | noun | interest, benefit
حَقْل | noun | field
"""),
("money and shopping", """
صَرْف | noun | exchange (of money)
تَحْوِيل | noun | transfer
رَصِيد | noun | balance, credit
قِسْط | noun | instalment
فَائِدَة | noun | benefit; interest (on money)
تَوْفِير | noun | saving
إِنْفَاق | noun | spending
مَصْرُوف | noun | pocket money; expense
غَلَاء | noun | high prices
تَضَخُّم | noun | inflation
ضَمَان | noun | guarantee
اِسْتِبْدَال | noun | exchange, replacement
جَوْدَة | noun | quality
سِلْعَة | noun | commodity
تَسْلِيم | noun | delivery, handing over
مُسْتَهْلِك | noun | consumer
"""),
("school and learning", """
مَرْحَلَة | noun | stage, phase
اِبْتِدَائِيّ | adj | primary
ثَانَوِيّ | adj | secondary
مَنْهَج | noun | curriculum; method
مُقَرَّر | noun | course (of study)
دَوْرَة | noun | course; cycle
مِنْحَة | noun | scholarship, grant
دِرَاسَة | noun | study
أُطْرُوحَة | noun | thesis
تَسْجِيل | noun | registration; recording
قَبُول | noun | acceptance, admission
رُسُوب | noun | failing (an exam)
غِيَاب | noun | absence
حُضُور | noun | attendance, presence
مُلَاحَظَة | noun | note; observation
مُحَاضِر | noun | lecturer
عَمِيد | noun | dean
مُخْتَبَر | noun | laboratory
تَجْرِبَة | noun | experiment; trial
نَظَرِيَّة | noun | theory
فَلْسَفَة | noun | philosophy
تَارِيخِيّ | adj | historical
عِلْمِيّ | adj | scientific
أَدَبِيّ | adj | literary
لُغَوِيّ | adj | linguistic
قَاعِدَة | noun | rule; base
إِمْلَاء | noun | dictation, spelling
نُطْق | noun | pronunciation
لَهْجَة | noun | dialect, accent
مُفْرَدَات | noun | vocabulary
نَصّ | noun | text
مَقَال | noun | article
مَصْدَر | noun | source
مَرْجِع | noun | reference
نَاشِر | noun | publisher
طَبْعَة | noun | edition
فِهْرِس | noun | index, table of contents
صَفْحَة | noun | page
سَطْر | noun | line (of text)
خَطّ | noun | line; handwriting
تَرْتِيب | noun | order, arrangement
تَلْخِيص | noun | summary
شَرْح | noun | explanation
تَعْرِيف | noun | definition
مُصْطَلَح | noun | term
فِكْر | noun | thought
مَفْهُوم | noun | concept
مَعْرِفَة | noun | knowing, acquaintance
ثَقَافِيّ | adj | cultural
"""),
("the town, travel and holidays", """
سَفَارَة | noun | embassy
قُنْصُلِيَّة | noun | consulate
إِقَامَة | noun | stay; residence
جَوْلَة | noun | tour
مُرْشِد | noun | guide
أَثَر | noun | trace; effect
مَعْلَم | noun | landmark
تِذْكَار | noun | souvenir
اِسْتِقْبَال | noun | reception
نُزُل | noun | inn, hostel
مُخَيَّم | noun | camp
خَيْمَة | noun | tent
مُسَافِر | noun | traveller
جُمْرُك | noun | customs
تَفْتِيش | noun | inspection, search
إِلْغَاء | noun | cancellation
تَأْخِير | noun | delay
مَقْعَد | noun | seat
مُرُور | noun | traffic; passing
رُخْصَة | noun | licence
مُخَالَفَة | noun | violation; fine
غَرَامَة | noun | fine (a penalty)
عَجَلَة | noun | wheel; hurry
مُحَرِّك | noun | engine
إِطَار | noun | tyre; frame
وَقُود | noun | fuel
شَاحِنَة | noun | lorry
بَاخِرَة | noun | steamship
طَيَرَان | noun | aviation, flying
هُبُوط | noun | landing; descent
إِقْلَاع | noun | take-off
"""),
("health and the body", """
وِقَايَة | noun | prevention
لَقَاح | noun | vaccine
عَدْوَى | noun | infection
فَيْرُوس | noun | virus
سَرَطَان | noun | cancer
حَسَاسِيَّة | noun | allergy; sensitivity
كَسْر | noun | fracture; breaking
اِلْتِهَاب | noun | inflammation
عَمَلِيَّة | noun | operation; process
جِرَاحَة | noun | surgery
جَرَّاح | noun | surgeon
تَحْلِيل | noun | analysis; test
فَحْص | noun | examination, check-up
حِمْيَة | noun | diet
غِذَاء | noun | food, nourishment
فِيتَامِين | noun | vitamin
لِيَاقَة | noun | fitness
تَدْخِين | noun | smoking
سِيجَارَة | noun | cigarette
كُحُول | noun | alcohol
إِدْمَان | noun | addiction
أَرَق | noun | insomnia
تَعَب | noun | tiredness
إِرْهَاق | noun | exhaustion
صِحِّيّ | adj | healthy; health (as an adjective)
جَسَدِيّ | adj | physical, bodily
شِفَاء | noun | recovery, cure
عُضْو | noun | member; organ
رِئَة | noun | lung
كَبِد | noun | liver
كُلْيَة | noun | kidney
عَضَلَة | noun | muscle
دِمَاغ | noun | brain
خَدّ | noun | cheek
ذَقْن | noun | chin
حَاجِب | noun | eyebrow
ظُفْر | noun | nail (of a finger)
كَعْب | noun | heel
بَشَرَة | noun | complexion
عَرَق | noun | sweat
دَمْعَة | noun | tear (from the eye)
نَفَس | noun | breath
نَبْض | noun | pulse
"""),
("nature, animals and the weather", """
طَاقَة | noun | energy
شَمْسِيّ | adj | solar
نِفْط | noun | oil, petroleum
غَاز | noun | gas
فَحْم | noun | coal
مَوْرِد | noun | resource
نُفَايَة | noun | waste, refuse
تَدْوِير | noun | recycling
حِمَايَة | noun | protection
خَطَر | noun | danger
كَارِثَة | noun | disaster
زِلْزَال | noun | earthquake
فَيَضَان | noun | flood
جَفَاف | noun | drought
بُرْكَان | noun | volcano
إِعْصَار | noun | hurricane
حَرِيق | noun | fire (a blaze)
دُخَان | noun | smoke
مَوْجَة | noun | wave
تَيَّار | noun | current
جَلِيد | noun | ice
قُطْب | noun | pole
كَوْن | noun | universe
فَضَاء | noun | space
صَخْرَة | noun | rock
مَعْدِن | noun | metal; mineral
تُرْبَة | noun | soil
بِذْرَة | noun | seed
جِذْر | noun | root
غُصْن | noun | branch (of a tree)
ثَمَرَة | noun | a fruit
حَصَاد | noun | harvest
مَزْرَعَة | noun | farm
مَاشِيَة | noun | livestock
صَيْد | noun | hunting; fishing
صَيَّاد | noun | hunter; fisherman
قَفَص | noun | cage
عُشّ | noun | nest
رِيشَة | noun | feather
جَنَاح | noun | wing
ذَيْل | noun | tail
أَلِيف | adj | tame, domestic
نَادِر | adj | rare
اِنْقِرَاض | noun | extinction
بِيئِيّ | adj | environmental
صِنَاعِيّ | adj | industrial
"""),
("the media and technology", """
إِعْلَام | noun | the media
صَحَافَة | noun | the press, journalism
مُرَاسِل | noun | correspondent
مُذِيع | noun | announcer
مُشَاهِد | noun | viewer
جُمْهُور | noun | audience; the public
قَارِئ | noun | reader
بَثّ | noun | broadcast
حَلْقَة | noun | episode; ring, circle
وَثَائِقِيّ | adj | documentary
تَعْلِيق | noun | comment
إِشَاعَة | noun | rumour
دِعَايَة | noun | propaganda; publicity
رَقَابَة | noun | censorship; supervision
تِقْنِيَة | noun | technology, technique
لَوْحَة | noun | painting; board, panel
طَابِعَة | noun | printer
شَحْن | noun | charging; shipping
بَطَّارِيَّة | noun | battery
اِتِّصَال | noun | contact, connection
إِلِكْتُرُونِيّ | adj | electronic
رَقْمِيّ | adj | digital
تَحْمِيل | noun | download; loading
تَحْدِيث | noun | update
رَابِط | noun | link
مُسْتَخْدِم | noun | user
خُصُوصِيَّة | noun | privacy
اِخْتِرَاع | noun | invention
اِكْتِشَاف | noun | discovery
تَطَوُّر | noun | development, evolution
تَقَدُّم | noun | progress
اِصْطِنَاعِيّ | adj | artificial
آلِيّ | adj | automatic
"""),
("the world and society", """
وِزَارَة | noun | ministry
وَزِير | noun | minister
بَرْلَمَان | noun | parliament
نَائِب | noun | deputy, member of parliament
اِنْتِخَاب | noun | election
مُرَشَّح | noun | candidate
حِزْب | noun | party (political)
مَلِك | noun | king
مَلِكَة | noun | queen
أَمِير | noun | prince
سُلْطَان | noun | sultan
سُلْطَة | noun | authority, power
دُسْتُور | noun | constitution
مَحْكَمَة | noun | court
قَاضٍ | noun | judge
مُتَّهَم | noun | the accused
تُهْمَة | noun | charge, accusation
جَرِيمَة | noun | crime
مُجْرِم | noun | criminal
سَرِقَة | noun | theft
لِصّ | noun | thief
سِجْن | noun | prison
عُقُوبَة | noun | punishment, penalty
شَاهِد | noun | witness
دَلِيل | noun | evidence; guide
تَحْقِيق | noun | investigation
عَدَالَة | noun | justice
ظُلْم | noun | injustice
مُسَاوَاة | noun | equality
مُوَاطِن | noun | citizen
هِجْرَة | noun | emigration
مُهَاجِر | noun | immigrant, emigrant
لَاجِئ | noun | refugee
أَقَلِّيَّة | noun | minority
أَغْلَبِيَّة | noun | majority
فَقْر | noun | poverty
ثَرْوَة | noun | wealth
طَبَقَة | noun | class; layer
جَمْعِيَّة | noun | association, society
مُتَطَوِّع | noun | volunteer
تَبَرُّع | noun | donation
حَمْلَة | noun | campaign
مُظَاهَرَة | noun | demonstration
ثَوْرَة | noun | revolution
اِسْتِقْلَال | noun | independence
اِسْتِعْمَار | noun | colonialism
مُعَاهَدَة | noun | treaty
أَزْمَة | noun | crisis
صِرَاع | noun | conflict
سِلَاح | noun | weapon
عَسْكَرِيّ | adj | military
مَدَنِيّ | adj | civil, civilian
سِيَاسِيّ | adj | political; a politician
اِجْتِمَاعِيّ | adj | social
اِقْتِصَادِيّ | adj | economic
وَطَنِيّ | adj | national, patriotic
عَالَمِيّ | adj | worldwide, global
إِسْلَامِيّ | adj | Islamic
مَسِيحِيّ | adj | Christian
يَهُودِيّ | adj | Jewish
دِينِيّ | adj | religious
تَقْلِيد | noun | tradition; imitation
تُرَاث | noun | heritage
هُوِيَّة | noun | identity
"""),
("culture and the arts", """
رَسَّام | noun | painter
تِمْثَال | noun | statue
مُوسِيقِيّ | adj | musical; a musician
لَحْن | noun | melody
عُود | noun | oud; stick
مَسْرَحِيَّة | noun | play (in a theatre)
مُمَثِّل | noun | actor; representative
مُخْرِج | noun | director (of a film)
قَصِيدَة | noun | poem
شَاعِر | noun | poet
أُسْطُورَة | noun | legend, myth
حِكَايَة | noun | tale
خَيَال | noun | imagination; fiction
وَاقِع | noun | reality
حَدَث | noun | event
مِهْرَجَان | noun | festival
تَصْوِير | noun | photography; filming
مُصَوِّر | noun | photographer
تَصْمِيم | noun | design
مُصَمِّم | noun | designer
ذَوْق | noun | taste (in style)
أُسْلُوب | noun | style
"""),
("free time, sport and the media", """
رِيَاضِيّ | adj | sporting; an athlete
بَطَل | noun | champion; hero
مُدَرِّب | noun | coach, trainer
حَكَم | noun | referee
مُشَجِّع | noun | fan, supporter
تَعَادُل | noun | draw (in a game)
هَزِيمَة | noun | defeat
مَيْدَالِيَة | noun | medal
سِبَاق | noun | race
جَرْي | noun | running
مَشْي | noun | walking
تَزَلُّج | noun | skiing, skating
مُلَاكَمَة | noun | boxing
مُصَارَعَة | noun | wrestling
تَسَلُّق | noun | climbing
"""),
("the home", """
سَكَن | noun | housing, accommodation
عَقَار | noun | property, real estate
مَالِك | noun | landlord, proprietor
مُسْتَأْجِر | noun | tenant
ضَاحِيَة | noun | suburb
صِيَانَة | noun | maintenance
تَصْلِيح | noun | repair
كَهْرَبَائِيّ | adj | electric; an electrician
تَدْفِئَة | noun | heating
تَكْيِيف | noun | air conditioning
سَاخِن | adj | hot (to the touch)
حَنَفِيَّة | noun | tap
مِغْسَلَة | noun | washbasin
مِرْحَاض | noun | toilet
حَوْض | noun | basin, tub; pool
مَوْقِد | noun | stove
مِكْنَسَة | noun | broom, vacuum cleaner
غُبَار | noun | dust
بُقْعَة | noun | stain, spot
رَائِحَة | noun | smell
عِطْر | noun | perfume
مَطْرَقَة | noun | hammer
مِسْمَار | noun | nail
حَبْل | noun | rope
سِلْك | noun | wire
خَيْط | noun | thread
قُمَاش | noun | cloth, fabric
شَمْعَة | noun | candle
عُلْبَة | noun | tin, small box
غِطَاء | noun | lid, cover
وِعَاء | noun | container, bowl
مِقْلَاة | noun | frying pan
صِينِيَّة | noun | tray
"""),
("food, cooking and eating out", """
قِرْفَة | noun | cinnamon
نَعْنَاع | noun | mint
خَلّ | noun | vinegar
طَحِين | noun | flour
عَجِين | noun | dough
مَعْكَرُونَة | noun | pasta
قَمْح | noun | wheat
ذُرَة | noun | maize
لَوْز | noun | almonds
جَوْز | noun | walnuts
فُسْتُق | noun | pistachios
كَرَز | noun | cherries
أَنَانَاس | noun | pineapple
بَاذِنْجَان | noun | aubergine
مَلْفُوف | noun | cabbage
فُطْر | noun | mushrooms
حِمَّص | noun | chickpeas; hummus
مَشْوِيّ | adj | grilled
مَقْلِيّ | adj | fried
مَسْلُوق | adj | boiled
نِيء | adj | raw
طَرِيّ | adj | tender, soft
عِجْل | noun | calf; veal
دِيك | noun | cockerel
مَائِدَة | noun | dining table, spread
ضِيَافَة | noun | hospitality
بَقْشِيش | noun | tip (for service)
مَذَاق | noun | flavour
"""),
("time and how often", """
حِقْبَة | noun | era, period
قَدِيمًا | adv | in the old days
تَدْرِيجِيّ | adj | gradual
فَجْأَةً | adv | suddenly
مُبَاشَرَةً | adv | directly
تَمَامًا | adv | completely, exactly
أَصْلًا | adv | originally, in the first place
عُمُومًا | adv | in general
خُصُوصًا | adv | particularly
نِسْبِيًّا | adv | relatively
شَخْصِيًّا | adv | personally
عَمْدًا | adv | deliberately
صُدْفَة | noun | chance, coincidence
عِنْدَئِذٍ | adv | then, at that point
آنَذَاكَ | adv | at that time
"""),
("little words", """
هٰكَذَا | adv | like this, thus
كَمَا | conj | as, just as
لٰكِنَّ | conj | but (before a noun or pronoun)
أَمَّا | conj | as for
إِذْ | conj | since, as; when
لَمَّا | conj | when (in the past)
بَعْدَمَا | conj | after (doing)
حِينَ | conj | when, at the time when
طَالَمَا | conj | as long as; (لَطَالَمَا) always
مَهْمَا | conj | whatever, however much
أَيْنَمَا | conj | wherever
إِضَافَة | noun | addition
أَجْل | noun | sake; deadline
دُونَ | prep | without; short of
تُجَاهَ | prep | towards (an attitude to)
قُرْبَ | prep | near (to)
أَسْفَلَ | prep | below, at the bottom of
طِوَالَ | prep | throughout
ثَمَّةَ | adv | there is, there are
قَطُّ | adv | never (in the past)
أَيُّهَا | particle | O (before a noun with the article)
كِلَا | noun | both
سَائِر | noun | the rest of
بِضْعَة | noun | a few
حَوَالَيْ | adv | around (a number)
"""),
("describing things", """
أَسَاسِيّ | adj | basic, essential
رَئِيسِيّ | adj | main
إِضَافِيّ | adj | extra, additional
نَاقِص | adj | incomplete, lacking
زَائِد | adj | surplus; plus
مُتَعَدِّد | adj | multiple
مُتَنَوِّع | adj | varied, diverse
مُشْتَرَك | adj | common, shared
فَرْدِيّ | adj | individual
مُبَاشِر | adj | direct; live
مُسْتَمِرّ | adj | continuous
مُؤَقَّت | adj | temporary
دَائِم | adj | permanent
نِهَائِيّ | adj | final
أَوَّلِيّ | adj | initial, preliminary
مُحْتَمَل | adj | likely, probable
غَامِض | adj | mysterious, vague
مُعَيَّن | adj | specific, certain
مَحْدُود | adj | limited
صَارِم | adj | strict
مَرِن | adj | flexible
ثَابِت | adj | fixed, stable
مُتَغَيِّر | adj | changing, variable
مُسْتَقِلّ | adj | independent
قَانُونِيّ | adj | legal
شَرْعِيّ | adj | legitimate; lawful
مَلِيء | adj | full of
خَالٍ | adj | free (of), vacant
هَائِل | adj | enormous, tremendous
ضَئِيل | adj | slight, meagre
بَارِز | adj | prominent
مَعْرُوف | adj | known, well-known
مَجْهُول | adj | unknown
شَائِع | adj | common, widespread
عَجِيب | adj | marvellous, strange
مُذْهِل | adj | amazing
مُخِيف | adj | frightening
مُقْلِق | adj | worrying
مُؤْلِم | adj | painful
مُثِير | adj | exciting; provocative
مُشَوِّق | adj | gripping, suspenseful
سَخِيف | adj | silly, ridiculous
لَائِق | adj | appropriate, decent
مُحْتَرَم | adj | respectable, respected
فَعَّال | adj | effective
نَاجِح | adj | successful
فَاشِل | adj | failed; a failure
مُتَقَدِّم | adj | advanced
مُتَخَلِّف | adj | backward
مُعَاصِر | adj | contemporary
مُسْتَقْبَلِيّ | adj | future (as an adjective)
سَنَوِيّ | adj | annual
شَهْرِيّ | adj | monthly
أُسْبُوعِيّ | adj | weekly
يَوْمِيّ | adj | daily (as an adjective)
لَيْلِيّ | adj | nightly, night (as an adjective)
"""),
("everyday verbs", """
أَثَّرَ | verb | to affect, influence
تَأَثَّرَ | verb | to be affected, be moved
أَدَّى | verb | to perform; to lead to
أَدَارَ | verb | to manage, run
أَشَارَ | verb | to point, indicate
أَضَافَ | verb | to add
أَعْلَنَ | verb | to announce
أَقَامَ | verb | to reside; to hold (an event)
أَلْغَى | verb | to cancel
أَنْتَجَ | verb | to produce
أَهْمَلَ | verb | to neglect
أَوْضَحَ | verb | to clarify
بَالَغَ | verb | to exaggerate
بَرَّرَ | verb | to justify
بَعَثَ | verb | to dispatch; to revive
تَابَعَ | verb | to follow, keep up with
تَبَادَلَ | verb | to exchange
تَجَنَّبَ | verb | to avoid
تَحَمَّلَ | verb | to bear, endure
تَحَقَّقَ | verb | to verify; to come true
حَقَّقَ | verb | to achieve; to investigate
تَخَيَّلَ | verb | to imagine
تَرَدَّدَ | verb | to hesitate
تَسَبَّبَ | verb | to cause
تَصَرَّفَ | verb | to behave, act
تَطَوَّرَ | verb | to develop, evolve
طَوَّرَ | verb | to develop (something)
تَعَامَلَ | verb | to deal (with)
تَعَاوَنَ | verb | to cooperate
تَفَاجَأَ | verb | to be surprised
تَفَاهَمَ | verb | to understand each other
تَمَتَّعَ | verb | to enjoy
اِسْتَمْتَعَ | verb | to have a good time
تَمَكَّنَ | verb | to manage to, be able to
تَنَافَسَ | verb | to compete
تَنَفَّسَ | verb | to breathe
تَوَجَّهَ | verb | to head (for)
تَوَصَّلَ | verb | to reach (a result)
تَوَفَّرَ | verb | to be available
وَفَّرَ | verb | to save; to provide
ثَبَتَ | verb | to be proven; to stand firm
جَادَلَ | verb | to argue
جَذَبَ | verb | to attract
حَارَبَ | verb | to fight
حَافَظَ | verb | to preserve, keep up
حَدَّدَ | verb | to determine, set
حَذَّرَ | verb | to warn
حَسَّنَ | verb | to improve (something)
حَكَمَ | verb | to rule; to judge
حَمَى | verb | to protect
خَطَّطَ | verb | to plan
خَدَعَ | verb | to deceive
خَصَّصَ | verb | to allocate, devote
دَافَعَ | verb | to defend
دَمَّرَ | verb | to destroy
ذَابَ | verb | to melt
رَاجَعَ | verb | to revise, review
رَاقَبَ | verb | to watch over, monitor
رَافَقَ | verb | to accompany
رَبَّى | verb | to bring up, raise
رَشَّحَ | verb | to nominate
رَمَى | verb | to throw
زَادَ | verb | to increase
زَرَعَ | verb | to plant
سَاهَمَ | verb | to contribute
سَجَّلَ | verb | to record; to register
سَيْطَرَ | verb | to control
شَجَّعَ | verb | to encourage
شَكَّ | verb | to doubt
شَمَلَ | verb | to include
صَمَّمَ | verb | to design; to be determined
ضَمِنَ | verb | to guarantee
طَبَعَ | verb | to print
طَرَدَ | verb | to expel, throw out
عَالَجَ | verb | to treat (a patient, a problem)
عَبَّرَ | verb | to express
عَاقَبَ | verb | to punish
عَثَرَ | verb | to come across, find
عَرَّفَ | verb | to introduce; to define
عَلَّقَ | verb | to hang; to comment
غَطَّى | verb | to cover
فَحَصَ | verb | to examine
فَسَّرَ | verb | to interpret
فَشِلَ | verb | to fail
قَارَنَ | verb | to compare
قَاوَمَ | verb | to resist
قَدَّرَ | verb | to appreciate; to estimate
قَدَّمَ | verb | to present, serve
قَلَّدَ | verb | to imitate
قَلَّلَ | verb | to reduce
كَشَفَ | verb | to uncover, reveal
اِكْتَشَفَ | verb | to discover
اِخْتَرَعَ | verb | to invent
كَافَحَ | verb | to struggle, combat
كَوَّنَ | verb | to form
لَجَأَ | verb | to resort; to take refuge
مَارَسَ | verb | to practise
مَثَّلَ | verb | to represent; to act
مَدَحَ | verb | to praise
نَاقَشَ | verb | to discuss
نَدِمَ | verb | to regret
نَشَرَ | verb | to publish; to spread
نَظَّمَ | verb | to organise
نَفَّذَ | verb | to carry out
هَاجَرَ | verb | to emigrate
هَاجَمَ | verb | to attack
هَدَّدَ | verb | to threaten
وَاجَهَ | verb | to face
وَثِقَ | verb | to trust
وَزَّعَ | verb | to distribute
وَصَفَ | verb | to describe
وَظَّفَ | verb | to employ
اِبْتَعَدَ | verb | to move away
اِتَّخَذَ | verb | to take (a decision, a measure)
اِتَّهَمَ | verb | to accuse
اِحْتَرَمَ | verb | to respect
اِحْتَوَى | verb | to contain
اِحْتَجَّ | verb | to protest
اِخْتَلَفَ | verb | to differ
اِرْتَفَعَ | verb | to rise
اِنْخَفَضَ | verb | to fall, drop
اِزْدَادَ | verb | to grow (more)
اِسْتَعَدَّ | verb | to prepare oneself
اِسْتَغْرَقَ | verb | to take (time), last
اِسْتَفَادَ | verb | to benefit
اِسْتَنْتَجَ | verb | to conclude, deduce
اِسْتَثْمَرَ | verb | to invest
اِشْتَكَى | verb | to complain
اِعْتَرَفَ | verb | to admit, confess
اِعْتَمَدَ | verb | to depend; to adopt
اِقْتَرَبَ | verb | to approach
اِنْتَبَهَ | verb | to pay attention
اِنْتَشَرَ | verb | to spread
اِنْتَخَبَ | verb | to elect
اِنْضَمَّ | verb | to join
اِنْفَجَرَ | verb | to explode
اِنْقَطَعَ | verb | to be cut off
اِسْتَبْدَلَ | verb | to replace
اِسْتَعَادَ | verb | to regain, recover
اِسْتَسْلَمَ | verb | to give up, surrender
اِمْتَلَكَ | verb | to own, possess
اِنْسَحَبَ | verb | to withdraw
اِنْتَقَدَ | verb | to criticise
أَنْقَذَ | verb | to rescue
أَسَّسَ | verb | to found, establish
أَصَرَّ | verb | to insist
أَقْنَعَ | verb | to persuade
اِقْتَنَعَ | verb | to be convinced
أَزْعَجَ | verb | to disturb, annoy
أَدْرَكَ | verb | to realise
أَتَاحَ | verb | to make possible, allow
أَثْبَتَ | verb | to prove
أَحَاطَ | verb | to surround
أَخْفَى | verb | to hide (something)
اِخْتَبَأَ | verb | to hide (oneself)
أَعَارَ | verb | to lend
اِسْتَعَارَ | verb | to borrow
أَجَّلَ | verb | to postpone
أَسْرَعَ | verb | to hurry
أَشْرَفَ | verb | to supervise
أَصَابَ | verb | to hit; to injure
أَطْلَقَ | verb | to release; to fire
أَعَادَ | verb | to repeat; to give back
غَرِقَ | verb | to drown, sink
أَقْلَعَ | verb | to take off; to give up (a habit)
هَبَطَ | verb | to land; to descend
عَطَسَ | verb | to sneeze
سَعَلَ | verb | to cough
نَزَفَ | verb | to bleed
شُفِيَ | verb | to recover (from an illness)
تَأَلَّمَ | verb | to suffer pain
تُوُفِّيَ | verb | to pass away
دَفَنَ | verb | to bury
كَبُرَ | verb | to grow up, get bigger
نَمَا | verb | to grow
اِزْدَهَرَ | verb | to flourish
تَخَلَّى | verb | to abandon, give up
تَرَاجَعَ | verb | to retreat, decline
سَخِرَ | verb | to mock
مَزَحَ | verb | to joke
صَرَخَ | verb | to shout, scream
هَمَسَ | verb | to whisper
صَمَتَ | verb | to fall silent
تَجَاهَلَ | verb | to ignore
اِحْتَمَلَ | verb | to put up with; to be likely
أَسَاءَ | verb | to do wrong, offend
سَامَحَ | verb | to forgive
شَتَمَ | verb | to insult, swear at
عَانَقَ | verb | to hug
قَبَّلَ | verb | to kiss
صَافَحَ | verb | to shake hands with
لَحِقَ | verb | to follow, catch up with
سَبَقَ | verb | to precede, go before
تَأَكَّدَ | verb | to make sure
جَهِلَ | verb | to be ignorant of
اِرْتَاحَ | verb | to feel at ease, be relieved
سَئِمَ | verb | to be fed up
مَلَّ | verb | to get bored
تَشَاجَرَ | verb | to quarrel
تَصَالَحَ | verb | to make up, be reconciled
خَانَ | verb | to betray
غَشَّ | verb | to cheat
اِسْتَقَرَّ | verb | to settle
اِسْتَكْشَفَ | verb | to explore
تَجَوَّلَ | verb | to wander around, tour
رَحَلَ | verb | to depart, move on
تَفَقَّدَ | verb | to check on
فَتَّشَ | verb | to search (a place, a person)
رَكَّبَ | verb | to install, assemble
فَكَّ | verb | to undo, untie
شَحَنَ | verb | to charge; to ship
حَمَّلَ | verb | to load; to download
حَذَفَ | verb | to delete
نَسَخَ | verb | to copy
لَصَقَ | verb | to stick, paste
ضَغَطَ | verb | to press
خَزَّنَ | verb | to store
"""),
]
