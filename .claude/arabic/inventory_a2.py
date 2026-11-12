"""The A2 inventory: the words the Arabic A2 deck teaches, on top of the shipped A1.

Written as `inventory.py` is (read its header: one line a word, `vowelled headword
| part of speech | English`, the English the card's own), for the topics the
CEFR's A2 descriptor names — personal and family information, shopping, local
geography, employment — and the everyday matters a course meets at the level:
describing people and feelings, the home, clothes, eating out, travel, health,
school, free time, the media, nature and the weather.  There is still no exam
board's list to read (`docs/arabic-decks-plan.md` §2).

A word the shipped A1 deck already teaches is never a line here; `select.py`
refuses one if it slips in (the `taught_below` arrangement), so the levels never
teach a headword twice.  The lines are more than the deck's size: the least
frequent are dropped, as at A1, and `select.py` prints which.
"""

TOPICS = [
("greetings and politeness", """
مَا شَاءَ اللّٰهُ | phrase | what God has willed (said in admiration)
يَا | particle | O (before the name of someone you call)
حَسَنًا | adv | all right, OK
هَيَّا | intj | come on! let's go!
مَعْذِرَة | noun | excuse, pardon
تَهْنِئَة | noun | congratulation (a message of)
"""),
("people and relationships", """
وَالِد | noun | father, parent
وَالِدَة | noun | mother (formal)
حَفِيد | noun | grandson, grandchild
عَرُوس | noun | bride
زَوَاج | noun | marriage
عُرْس | noun | wedding
مُتَزَوِّج | adj | married
أَعْزَب | adj | single, unmarried
طُفُولَة | noun | childhood
شَبَاب | noun | youth, young people
جِيل | noun | generation
عَلَاقَة | noun | relationship; connection
زَمِيل | noun | colleague, classmate
رَفِيق | noun | companion
حَبِيب | noun | darling, loved one
جَمَاعَة | noun | group of people, community
مُجْتَمَع | noun | society
شَعْب | noun | people, nation
سَيِّد | noun | Mr; gentleman
سَيِّدَة | noun | Mrs; lady
آنِسَة | noun | Miss
إِنْسَان | noun | human being
بَشَر | noun | humankind, people
فَتَاة | noun | girl, young woman
فَتًى | noun | boy, young man
وِلَادَة | noun | birth
مَوْت | noun | death
سَاكِن | noun | resident, inhabitant
"""),
("describing people", """
طَيِّب | adj | kind, good-hearted
لَطِيف | adj | nice, pleasant
ذَكِيّ | adj | clever
غَبِيّ | adj | stupid
كَسْلَان | adj | lazy
نَشِيط | adj | active, energetic
هَادِئ | adj | calm, quiet
عَصَبِيّ | adj | nervous, short-tempered
خَجُول | adj | shy
شُجَاع | adj | brave
صَادِق | adj | honest, truthful
كَرِيم | adj | generous
مُؤَدَّب | adj | polite
قَوِيّ | adj | strong
ضَعِيف | adj | weak
سَمِين | adj | fat
نَحِيف | adj | thin (of a person)
وَسِيم | adj | handsome
قَبِيح | adj | ugly
عَجُوز | noun | old woman, old man
مَجْنُون | adj | mad, crazy
مُمْتَاز | adj | excellent
رَائِع | adj | wonderful
عَظِيم | adj | great
"""),
("feelings", """
شُعُور | noun | feeling
فَرَح | noun | joy
سَعَادَة | noun | happiness
حُزْن | noun | sadness
خَوْف | noun | fear
غَضَب | noun | anger
غَاضِب | adj | angry
خَائِف | adj | afraid
قَلِق | adj | worried
مَسْرُور | adj | pleased, glad
مُتَأَكِّد | adj | sure, certain
مُسْتَعِدّ | adj | ready, prepared (of a person)
جَاهِز | adj | ready (done, prepared)
وَحِيد | adj | alone, lonely; only
مُهْتَمّ | adj | interested
أَمَل | noun | hope
حُلْم | noun | dream
مُمِلّ | adj | boring
مُمْتِع | adj | enjoyable, fun
مُفِيد | adj | useful
مُضْحِك | adj | funny
غَرِيب | adj | strange; stranger
خَطِير | adj | dangerous; serious
آمِن | adj | safe
مُرِيح | adj | comfortable
مُزْعِج | adj | annoying
حَظّ | noun | luck
"""),
("the home", """
أَثَاث | noun | furniture
خِزَانَة | noun | cupboard, wardrobe
رَفّ | noun | shelf
مِرْآة | noun | mirror
سِتَارَة | noun | curtain
سَجَّادَة | noun | carpet, rug
مِصْبَاح | noun | lamp
ثَلَّاجَة | noun | fridge
فُرْن | noun | oven
غَسَّالَة | noun | washing machine
جِدَار | noun | wall
سَقْف | noun | ceiling; roof
أَرْضِيَّة | noun | floor (the surface)
دَرَج | noun | stairs
مِصْعَد | noun | lift
صَالَة | noun | hall, living room
مَمَرّ | noun | corridor
شُرْفَة | noun | balcony
سَطْح | noun | flat roof; surface
كَهْرَبَاء | noun | electricity
مِخَدَّة | noun | pillow
بَطَّانِيَّة | noun | blanket
مِنْشَفَة | noun | towel
صَابُون | noun | soap
فُرْشَاة | noun | brush
مِشْط | noun | comb
مِقَصّ | noun | scissors
سِكِّين | noun | knife
شَوْكَة | noun | fork
مِلْعَقَة | noun | spoon
فِنْجَان | noun | cup (for coffee or tea)
كَأْس | noun | drinking glass
زُجَاجَة | noun | bottle
قِدْر | noun | cooking pot
إِبْرِيق | noun | jug, teapot
صُنْدُوق | noun | box
كِيس | noun | bag (of plastic or paper)
سَلَّة | noun | basket
قُمَامَة | noun | rubbish
إِيجَار | noun | rent
بِنَايَة | noun | building
عِمَارَة | noun | block of flats
بَوَّابَة | noun | gate
نَوْم | noun | sleep
نَظَافَة | noun | cleanliness, cleaning
عَادَة | noun | habit, custom
"""),
("clothes", """
ثَوْب | noun | robe, garment
فُسْتَان | noun | dress
تَنُّورَة | noun | skirt
بِنْطَال | noun | trousers
مِعْطَف | noun | coat
قُبَّعَة | noun | hat
جَوْرَب | noun | sock
حِزَام | noun | belt
نَظَّارَة | noun | glasses, spectacles
خَاتَم | noun | ring (on a finger)
جَيْب | noun | pocket
زِرّ | noun | button
حِجَاب | noun | headscarf
قُفَّاز | noun | glove
مَقَاس | noun | size (of clothes)
صُوف | noun | wool
قُطْن | noun | cotton
جِلْد | noun | leather; skin
حَرِير | noun | silk
ضَيِّق | adj | tight, narrow
وَاسِع | adj | wide, roomy
أَنِيق | adj | smart, elegant
"""),
("food, cooking and eating out", """
بَصَل | noun | onions
ثُوم | noun | garlic
جَزَر | noun | carrots
خِيَار | noun | cucumbers; choice
خَسّ | noun | lettuce
فُول | noun | broad beans
عَدَس | noun | lentils
زَيْت | noun | oil
زَيْتُون | noun | olives
زُبْدَة | noun | butter
لَبَن | noun | yoghurt; milk
عَسَل | noun | honey
مُرَبَّى | noun | jam
فِلْفِل | noun | pepper
عِنَب | noun | grapes
بِطِّيخ | noun | watermelon
لَيْمُون | noun | lemons
فَرَاوِلَة | noun | strawberries
مِشْمِش | noun | apricots
تِين | noun | figs
رُمَّان | noun | pomegranates
خَوْخ | noun | peaches
كَعْكَة | noun | cake
حَلْوَى | noun | sweets, dessert
شُوكُولَاتَة | noun | chocolate
حَسَاء | noun | soup
سَلَطَة | noun | salad
خَرُوف | noun | sheep, lamb
بَقَرَة | noun | cow
دَجَاجَة | noun | hen
شَطِيرَة | noun | sandwich
وَجْبَة | noun | meal
طَبَق | noun | dish (of food)
مَشْرُوب | noun | drink
قَائِمَة | noun | list; menu
فَاتُورَة | noun | bill, invoice
حِسَاب | noun | account; the bill
نَادِل | noun | waiter
طَبَّاخ | noun | cook
وَصْفَة | noun | recipe; prescription
طَعْم | noun | taste
حُلْو | adj | sweet
مُرّ | adj | bitter
مَالِح | adj | salty
طَازَج | adj | fresh
نَاضِج | adj | ripe; mature
شَبْعَان | adj | full (after eating)
نَبَاتِيّ | adj | vegetarian
قِطْعَة | noun | piece
كِيلُوغْرَام | noun | kilogram
لِتْر | noun | litre
كَمِّيَّة | noun | quantity, amount
"""),
("shopping and services", """
تَسَوُّق | noun | shopping
زَبُون | noun | customer
بَائِع | noun | seller, shop assistant
دُكَّان | noun | small shop
مَرْكَز | noun | centre
تِجَارَة | noun | trade, commerce
تَاجِر | noun | merchant
بِضَاعَة | noun | goods
خَصْم | noun | discount; opponent
تَخْفِيض | noun | reduction, sale
عَرْض | noun | offer; show; width
ثَمَن | noun | cost, value
عُمْلَة | noun | currency; coin
دُولَار | noun | dollar
رِيَال | noun | riyal
جُنَيْه | noun | pound (Egyptian, Sudanese)
دِرْهَم | noun | dirham
بِطَاقَة | noun | card
بَرِيد | noun | post, mail
طَابَع | noun | stamp
طَرْد | noun | parcel
ظَرْف | noun | envelope; circumstance
إِيصَال | noun | receipt
حَلَّاق | noun | barber, hairdresser
خَيَّاط | noun | tailor
مَخْبَز | noun | bakery
جَزَّار | noun | butcher
مَجَّانِيّ | adj | free (of charge)
مُتَاح | adj | available
"""),
("the town, travel and holidays", """
مَيْدَان | noun | square (in a town); field
سَاحَة | noun | open space, courtyard
حَيّ | noun | district, neighbourhood
جِسْر | noun | bridge
زَاوِيَة | noun | corner; angle
إِشَارَة | noun | sign, signal; traffic light
رَصِيف | noun | pavement; platform
مَوْقِف | noun | stop; car park; position
مَتْحَف | noun | museum
مَسْرَح | noun | theatre
سِينَمَا | noun | cinema
مَلْعَب | noun | stadium, pitch
نَادٍ | noun | club
كَنِيسَة | noun | church
مَعْبَد | noun | temple
قَصْر | noun | palace
بُرْج | noun | tower
مَصْنَع | noun | factory
مِينَاء | noun | port, harbour
سَفِينَة | noun | ship
قَارِب | noun | boat
دَرَّاجَة | noun | bicycle
مِتْرُو | noun | underground, metro
رِحْلَة | noun | trip, journey
سَائِح | noun | tourist
سِيَاحَة | noun | tourism
جَوَاز سَفَر | noun | passport
تَأْشِيرَة | noun | visa
حُدُود | noun | border, borders
حَجْز | noun | booking, reservation
أَمْتِعَة | noun | luggage
خَرِيطَة | noun | map
اِتِّجَاه | noun | direction
مَسَافَة | noun | distance
وُصُول | noun | arrival
مُغَادَرَة | noun | departure
سَائِق | noun | driver
رَاكِب | noun | passenger
بَنْزِين | noun | petrol
حَادِث | noun | accident
زِحَام | noun | crowding; traffic jam
شَاطِئ | noun | beach, shore
جَزِيرَة | noun | island
بُحَيْرَة | noun | lake
غَابَة | noun | forest
وَادٍ | noun | valley
تَلّ | noun | hill
رِيف | noun | countryside
مَنْطِقَة | noun | area, region
مَدْخَل | noun | entrance
مَخْرَج | noun | exit
وَسَط | noun | middle, centre (of a place)
جَانِب | noun | side
مُزْدَحِم | adj | crowded
"""),
("health and the body", """
مُمَرِّض | noun | nurse
عِيَادَة | noun | clinic
عِلَاج | noun | treatment, cure
حَبَّة | noun | pill; grain
إِبْرَة | noun | needle; injection
جُرْح | noun | wound
حُمَّى | noun | fever
زُكَام | noun | cold (the illness)
سُعَال | noun | cough
صُدَاع | noun | headache
حَرَارَة | noun | heat; temperature
دَم | noun | blood
عَظْم | noun | bone
كَتِف | noun | shoulder
ذِرَاع | noun | arm
إِصْبَع | noun | finger
رُكْبَة | noun | knee
قَدَم | noun | foot
صَدْر | noun | chest
رَقَبَة | noun | neck
لِسَان | noun | tongue
شَفَة | noun | lip
مَعِدَة | noun | stomach
عَقْل | noun | mind, reason
نَفْس | noun | self; soul
رُوح | noun | spirit, soul
إِسْعَاف | noun | first aid; ambulance
طَوَارِئ | noun | emergency
تَمْرِين | noun | exercise
وَزْن | noun | weight
طُول | noun | length; height
سَلِيم | adj | healthy, sound
مُصَاب | adj | injured
أَعْمَى | adj | blind
حَامِل | adj | pregnant
"""),
("work and jobs", """
وَظِيفَة | noun | job, post
مِهْنَة | noun | profession
عَامِل | noun | worker
مُدِير | noun | manager, director
صَاحِب | noun | owner; friend
مُحَامٍ | noun | lawyer
مُحَاسِب | noun | accountant
صَحَفِيّ | noun | journalist
فَلَّاح | noun | farmer
جُنْدِيّ | noun | soldier
جَيْش | noun | army
شُرْطِيّ | noun | police officer
طَيَّار | noun | pilot
فَنَّان | noun | artist
مُغَنٍّ | noun | singer
كَاتِب | noun | writer
مُتَرْجِم | noun | translator
رَاتِب | noun | salary
اِجْتِمَاع | noun | meeting
مَشْرُوع | noun | project
خِبْرَة | noun | experience
مَهَارَة | noun | skill
مُقَابَلَة | noun | interview
إِجَازَة | noun | leave, time off; licence
مَسْؤُول | adj | responsible; an official
آلَة | noun | machine; instrument
أَدَاة | noun | tool
عَقْد | noun | contract
خِدْمَة | noun | service
اِقْتِصَاد | noun | economy
صِنَاعَة | noun | industry
زِرَاعَة | noun | farming, agriculture
"""),
("school and learning", """
تَعْلِيم | noun | education
مَادَّة | noun | school subject; material
اِمْتِحَان | noun | exam
اِخْتِبَار | noun | test
نَتِيجَة | noun | result
دَرَجَة | noun | degree; grade
شَهَادَة | noun | certificate
تِلْمِيذ | noun | pupil
أُسْتَاذ | noun | professor; teacher (a title)
كُلِّيَّة | noun | college, faculty
فَصْل | noun | chapter; class; season
مُحَاضَرَة | noun | lecture
وَاجِب | noun | duty; homework
مِثَال | noun | example
مَعْنًى | noun | meaning
قَامُوس | noun | dictionary
حَرْف | noun | letter (of the alphabet)
سَبُّورَة | noun | blackboard
مِسْطَرَة | noun | ruler (for lines)
عِلْم | noun | knowledge; science
جُغْرَافِيَا | noun | geography
رِيَاضِيَّات | noun | mathematics
فِيزِيَاء | noun | physics
كِيمْيَاء | noun | chemistry
أَدَب | noun | literature; good manners
فَنّ | noun | art
شِعْر | noun | poetry
رِوَايَة | noun | novel
مَجَلَّة | noun | magazine
جَرِيدَة | noun | newspaper
مَعْلُومَات | noun | information
بَحْث | noun | research; search
مُسْتَوًى | noun | level
خَطَأ | noun | mistake
فَرْق | noun | difference
نَجَاح | noun | success
"""),
("free time, sport and the media", """
هِوَايَة | noun | hobby
فَرَاغ | noun | free time; emptiness
نُزْهَة | noun | outing, stroll
سِبَاحَة | noun | swimming
رَقْص | noun | dancing
غِنَاء | noun | singing
أُغْنِيَة | noun | song
فِرْقَة | noun | band, troupe
فَرِيق | noun | team
مُبَارَاة | noun | match
لَاعِب | noun | player
هَدَف | noun | goal; aim
فَوْز | noun | win, victory
بُطُولَة | noun | championship; heroism
بَرْنَامَج | noun | programme
مُسَلْسَل | noun | series (on television)
قَنَاة | noun | channel; canal
إِذَاعَة | noun | broadcasting; radio station
رَادْيُو | noun | radio
إِعْلَان | noun | advertisement; announcement
كَامِيرَا | noun | camera
مَعْرِض | noun | exhibition
حَفْل | noun | ceremony; concert
شَطْرَنْج | noun | chess
تِنِس | noun | tennis
"""),
("talking, phones and computers", """
إِنْتَرْنِت | noun | internet
مَوْقِع | noun | website; site, location
شَاشَة | noun | screen
جِهَاز | noun | device, appliance
جَوَّال | noun | mobile phone
مُكَالَمَة | noun | phone call
كَلَام | noun | speech, talk
حَدِيث | noun | conversation; hadith
نِقَاش | noun | discussion
رَأْي | noun | opinion
تَرْجَمَة | noun | translation
شَبَكَة | noun | network; net
تَطْبِيق | noun | app, application
مَلَفّ | noun | file
نَسْخَة | noun | copy
"""),
("nature, animals and the weather", """
طَبِيعَة | noun | nature
هَوَاء | noun | air
غَيْمَة | noun | cloud
عَاصِفَة | noun | storm
بَرْق | noun | lightning
رَعْد | noun | thunder
ضَبَاب | noun | fog
بَرْد | noun | cold (the weather)
نَجْم | noun | star
كَوْكَب | noun | planet
تُرَاب | noun | earth, dust
رَمْل | noun | sand
حَجَر | noun | stone
نَبَات | noun | plant
عُشْب | noun | grass
وَرْدَة | noun | rose
مَاعِز | noun | goat
حِمَار | noun | donkey
أَسَد | noun | lion
فِيل | noun | elephant
ذِئْب | noun | wolf
دُبّ | noun | bear
قِرْد | noun | monkey
فَأْر | noun | mouse
أَرْنَب | noun | rabbit
ثَعْلَب | noun | fox
أَفْعَى | noun | snake
نَمْلَة | noun | ant
ذُبَابَة | noun | fly
نَحْلَة | noun | bee
فَرَاشَة | noun | butterfly
عُصْفُور | noun | sparrow, small bird
حَشَرَة | noun | insect
مُحِيط | noun | ocean
بِيئَة | noun | environment
تَلَوُّث | noun | pollution
مُنَاخ | noun | climate
مُشْمِس | adj | sunny
مُمْطِر | adj | rainy
رَطْب | adj | humid, damp
جَافّ | adj | dry
مُعْتَدِل | adj | mild, moderate
"""),
("the world and society", """
قَارَّة | noun | continent
حُكُومَة | noun | government
سِيَاسَة | noun | politics; policy
قَانُون | noun | law
حَقّ | noun | right; truth
حَرْب | noun | war
أَمْن | noun | security, safety
دِين | noun | religion
ثَقَافَة | noun | culture
حَضَارَة | noun | civilisation
فَرَنْسِيّ | adj | French
أَلْمَانِيّ | adj | German
أَمْرِيكِيّ | adj | American
مِصْرِيّ | adj | Egyptian
أَجْنَبِيّ | adj | foreign; a foreigner
"""),
("time and how often", """
لَحْظَة | noun | moment
ثَانِيَة | noun | second (of time)
قَرْن | noun | century; horn
مُسْتَقْبَل | noun | future
مَاضٍ | noun | the past
حَاضِر | noun | the present
فَتْرَة | noun | period, spell
مُدَّة | noun | length of time
مَوْسِم | noun | season (of an activity)
فَجْر | noun | dawn
غُرُوب | noun | sunset
عَصْر | noun | afternoon; age, era
قَرِيبًا | adv | soon
فَوْرًا | adv | immediately
مُبَكِّرًا | adv | early
مُتَأَخِّرًا | adv | late
عَادَةً | adv | usually
نَادِرًا | adv | rarely
يَوْمِيًّا | adv | daily, every day
أَخِيرًا | adv | finally, at last
سَابِقًا | adv | previously
حَالِيًّا | adv | at present, currently
"""),
("little words", """
خَارِجَ | prep | outside
دَاخِلَ | prep | inside
عَبْرَ | prep | across; via
نَحْوَ | prep | towards; about
ضِدَّ | prep | against
بِدُونِ | prep | without
خِلَالَ | prep | during; through
مُنْذُ | prep | since; ago
حَسَبَ | prep | according to
لَدَى | prep | at, with (in someone's keeping)
تَقْرِيبًا | adv | approximately, almost
حَقًّا | adv | really, truly
فِعْلًا | adv | actually, indeed
خَاصَّةً | adv | especially
مَثَلًا | adv | for example
رُبَّمَا | adv | perhaps
لِذٰلِكَ | adv | so, therefore
إِذَنْ | adv | so, then, in that case
كَذٰلِكَ | adv | likewise, also
بَلْ | conj | but rather, on the contrary
أَمْ | conj | or (in a question)
إِمَّا | conj | either
كَأَنَّ | conj | as if
لَوْ | conj | if (of something unreal)
كَيْ | conj | so that
بَيْنَمَا | conj | while, whereas
حَيْثُ | conj | where
كُلَّمَا | conj | whenever
لَعَلَّ | particle | perhaps, it may be that
إِلَّا | particle | except
جَمِيع | noun | all, the whole of
مُعْظَم | noun | most
عِدَّة | noun | several
كَافٍ | adj | enough
آخَر | adj | other, another
أُولٰئِكَ | pron | those
اَلَّذِينَ | pron | who, which (plural)
هُمَا | pron | they (two)
هُنَّ | pron | they (women)
"""),
("numbers and amounts", """
رَابِع | adj | fourth
خَامِس | adj | fifth
سَادِس | adj | sixth
سَابِع | adj | seventh
ثَامِن | adj | eighth
تَاسِع | adj | ninth
عَاشِر | adj | tenth
سِتُّونَ | num | sixty
سَبْعُونَ | num | seventy
ثَمَانُونَ | num | eighty
تِسْعُونَ | num | ninety
ثُلُث | noun | a third
ضِعْف | noun | double, twice as much
نِسْبَة | noun | percentage, ratio
"""),
("describing things", """
عَالٍ | adj | high; loud
مُنْخَفِض | adj | low
عَمِيق | adj | deep
عَرِيض | adj | broad
رَفِيع | adj | thin, fine; high-ranking
سَمِيك | adj | thick
حَادّ | adj | sharp
نَاعِم | adj | soft, smooth
خَشِن | adj | rough
قَاسٍ | adj | hard, harsh
ضَخْم | adj | huge
وَاضِح | adj | clear
مُسْتَحِيل | adj | impossible
ضَرُورِيّ | adj | necessary
عَادِيّ | adj | ordinary, normal
طَبِيعِيّ | adj | natural
حَقِيقِيّ | adj | real
رَسْمِيّ | adj | official, formal
عَامّ | adj | public, general
دَوْلِيّ | adj | international
مَحَلِّيّ | adj | local
عَصْرِيّ | adj | modern
تَقْلِيدِيّ | adj | traditional
شَعْبِيّ | adj | popular, folk
مُنَاسِب | adj | suitable
مُتَوَسِّط | adj | average, medium
أَخِير | adj | last, latest
قَادِم | adj | next, coming
سَابِق | adj | previous, former
مَكْسُور | adj | broken
حُرّ | adj | free (not bound)
مَمْنُوع | adj | forbidden
خَاطِئ | adj | wrong
دَقِيق | adj | exact, precise
بَسِيط | adj | simple
مُعَقَّد | adj | complicated
مُظْلِم | adj | dark
فَاتِح | adj | light (of a colour)
غَامِق | adj | dark (of a colour)
بُرْتُقَالِيّ | adj | orange (the colour)
بُنِّيّ | adj | brown
رَمَادِيّ | adj | grey
وَرْدِيّ | adj | pink
بَنَفْسَجِيّ | adj | purple
ذَهَبِيّ | adj | golden
ذَهَب | noun | gold
فِضَّة | noun | silver
حَدِيد | noun | iron
خَشَب | noun | wood
زُجَاج | noun | glass (the material)
"""),
("ideas and things", """
أَمْر | noun | matter, affair; order
شَكْل | noun | shape, form
حَجْم | noun | size
مَوْضُوع | noun | subject, topic
حَلّ | noun | solution
فُرْصَة | noun | chance, opportunity
حَال | noun | state, condition
وَضْع | noun | situation
طَرِيقَة | noun | way, method
خُطَّة | noun | plan
قَرَار | noun | decision
اِخْتِيَار | noun | choice
مُسَاعَدَة | noun | help
سُرْعَة | noun | speed
قُوَّة | noun | strength, force
حَرَكَة | noun | movement
صَبْر | noun | patience
اِحْتِرَام | noun | respect
ثِقَة | noun | trust, confidence
شُكْر | noun | thanks
حَقِيقَة | noun | truth, fact
كِذْب | noun | lying, lies
سِرّ | noun | secret
جَوّ | noun | atmosphere; the weather
جَائِزَة | noun | prize
عَلَامَة | noun | mark, sign
دَوْر | noun | role; turn
نِظَام | noun | system; order
مَجْمُوعَة | noun | group, collection
قِسْم | noun | department, section
ذِكْرَى | noun | memory (a thing remembered)
ذَاكِرَة | noun | memory (the faculty)
حُرِّيَّة | noun | freedom
جَمَال | noun | beauty
مُنَاسَبَة | noun | occasion
اِحْتِفَال | noun | celebration
زِيَارَة | noun | visit
دَعْوَة | noun | invitation; call
"""),
("everyday verbs", """
اِبْتَسَمَ | verb | to smile
اِحْتَفَلَ | verb | to celebrate
اِخْتَارَ | verb | to choose
اِسْتَأْجَرَ | verb | to rent
اِسْتَرَاحَ | verb | to rest
اِسْتَقْبَلَ | verb | to receive, welcome (a guest)
اِعْتَذَرَ | verb | to apologise
اِقْتَرَحَ | verb | to suggest
اِلْتَقَى | verb | to meet up, come together
اِنْتَقَلَ | verb | to move (house, place)
اِهْتَمَّ | verb | to care about, be interested in
أَصْبَحَ | verb | to become; to be in the morning
أَخْبَرَ | verb | to tell, inform
أَصْلَحَ | verb | to repair
أَعَدَّ | verb | to prepare
أَعْجَبَ | verb | to please (أَعْجَبَنِي: I liked it)
أَكْمَلَ | verb | to complete, carry on with
أَنْهَى | verb | to finish (something)
أَوْقَفَ | verb | to stop (something)
بَنَى | verb | to build
تَأَخَّرَ | verb | to be late
تَحَدَّثَ | verb | to talk, chat
تَحَسَّنَ | verb | to improve, get better
تَخَرَّجَ | verb | to graduate
تَرْجَمَ | verb | to translate
تَزَوَّجَ | verb | to marry
تَعَرَّفَ | verb | to get to know
تَعِبَ | verb | to get tired
تَغَيَّرَ | verb | to change (become different)
غَيَّرَ | verb | to change (something)
تَقَدَّمَ | verb | to advance; to apply
تَمَنَّى | verb | to wish
تَوَقَّفَ | verb | to stop, come to a halt
تَوَقَّعَ | verb | to expect
جَرَّبَ | verb | to try (out)
رَكَضَ | verb | to run
جَمَعَ | verb | to collect, gather
حَدَثَ | verb | to happen
حَصَلَ | verb | to get, obtain; to happen
حَفِظَ | verb | to memorise; to keep
حَلَّ | verb | to solve
خَسِرَ | verb | to lose (a game, money)
رَبِحَ | verb | to win, earn
فَازَ | verb | to win
دَعَا | verb | to invite; to call
ذَكَرَ | verb | to mention
رَتَّبَ | verb | to arrange, tidy
رَدَّ | verb | to reply; to give back
رَفَضَ | verb | to refuse
رَقَصَ | verb | to dance
سَرَقَ | verb | to steal
سَقَطَ | verb | to fall
سَمَحَ | verb | to allow
سَهِرَ | verb | to stay up late
شَاهَدَ | verb | to watch
شَرَحَ | verb | to explain
شَكَرَ | verb | to thank
صَدَّقَ | verb | to believe (someone)
صَعِدَ | verb | to go up, climb
نَزَلَ | verb | to go down, get off
صَلَّى | verb | to pray
صَنَعَ | verb | to make, manufacture
ضَرَبَ | verb | to hit
طَلَبَ | verb | to ask for, order
طَارَ | verb | to fly
ظَنَّ | verb | to think, suppose
عَادَ | verb | to come back, go back again
عَبَرَ | verb | to cross
عَدَّ | verb | to count
عَرَضَ | verb | to show, offer
فَقَدَ | verb | to lose
قَرَّرَ | verb | to decide
قَصَدَ | verb | to mean, intend
قَضَى | verb | to spend (time)
صَرَفَ | verb | to spend (money)
قَطَعَ | verb | to cut
قَادَ | verb | to drive, lead
كَسَرَ | verb | to break
لَاحَظَ | verb | to notice
لَمَسَ | verb | to touch
مَلَأَ | verb | to fill
مَنَعَ | verb | to prevent, forbid
نَجَحَ | verb | to succeed; to pass (an exam)
نَظَّفَ | verb | to clean
نَقَلَ | verb | to move, carry
وَافَقَ | verb | to agree
وَعَدَ | verb | to promise
وَقَفَ | verb | to stand; to stop
وَقَعَ | verb | to fall; to be located
هَرَبَ | verb | to escape, run away
اِسْتَحَمَّ | verb | to have a bath or shower
حَلَقَ | verb | to shave
مَسَحَ | verb | to wipe
أَطْفَأَ | verb | to switch off, put out
أَشْعَلَ | verb | to light; to switch on
شَغَّلَ | verb | to start, run (a machine)
اِشْتَاقَ | verb | to miss (someone), long for
أَمَرَ | verb | to order, command
اِسْتَمَرَّ | verb | to continue
اِشْتَرَكَ | verb | to take part; to subscribe
حَجَزَ | verb | to book, reserve
حَضَرَ | verb | to attend, be present
غَادَرَ | verb | to leave, depart
تَنَاوَلَ | verb | to have (food, a meal); to take
تَمَشَّى | verb | to take a walk
تَسَوَّقَ | verb | to go shopping
عَلِمَ | verb | to learn of, find out
ظَهَرَ | verb | to appear
اِخْتَفَى | verb | to disappear
كَذَبَ | verb | to lie, tell a lie
حَكَى | verb | to tell (a story)
شَارَكَ | verb | to share; to join in
رَحَّبَ | verb | to welcome
جَهَّزَ | verb | to get ready, equip
اِعْتَقَدَ | verb | to believe (hold an opinion)
قَبِلَ | verb | to accept
أَيْقَظَ | verb | to wake (someone) up
نَصَحَ | verb | to advise
اِسْتَلَمَ | verb | to receive (a thing)
وَدَّعَ | verb | to say goodbye to
سَلَّمَ | verb | to greet; to hand over
ضَاعَ | verb | to get lost
مَرَّ | verb | to pass (by)
مَرِضَ | verb | to fall ill
أَكَّدَ | verb | to confirm, stress
كَلَّفَ | verb | to cost
وَزَنَ | verb | to weigh
قَاسَ | verb | to measure
رَبَطَ | verb | to tie
خَلَعَ | verb | to take off (clothes)
اِرْتَدَى | verb | to dress in, wear
فَرِحَ | verb | to be glad
حَزِنَ | verb | to be sad
غَضِبَ | verb | to get angry
قَلِقَ | verb | to worry
اِعْتَادَ | verb | to get used to
كَادَ | verb | to nearly (do), almost
ظَلَّ | verb | to keep on, remain
"""),
]
