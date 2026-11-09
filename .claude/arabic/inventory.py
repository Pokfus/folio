"""The A1 inventory: the words the Arabic A1 deck teaches, written for the level's scope.

THERE IS NO EXAM BOARD'S LIST TO READ.  No Arabic proficiency test publishes an
open graded vocabulary (see `docs/arabic-decks-plan.md` §2), so the deck is
ASSEMBLED, as the Indonesian, Russian and Turkish decks were: a vocabulary written
here for the A1 descriptor's topics, one line a word, and dealt by frequency.

ONE LINE A WORD: `vowelled headword | part of speech | English`.
  * The headword is written as Wiktionary's canonical form spells it, so the join
    in `select.py` is exact; where it is not, the join falls back to the bare
    spelling and the part of speech and says so.  The CARD prints Wiktionary's
    form, never this one.
  * The part of speech is kaikki's own name (noun, verb, adj, adv, pron, prep,
    conj, num, particle, intj, phrase) and picks between homographs.
  * The English is the card's — written for a learner, short, British spelling.
    Wiktionary's glosses are a dictionary's ("to mark (symbols, shapes …) on a
    surface") and are used only to choose between two entries of one spelling.
    A verb is named by its past third person masculine, as every Arabic
    dictionary names it, and glossed "to …".

Modern Standard Arabic throughout: no dialect word is taught, and where the
spoken varieties differ the card says nothing of them.
"""

TOPICS = [
("greetings and politeness", """
مَرْحَبًا | intj | hello
أَهْلًا | intj | hi, welcome
أَهْلًا وَسَهْلًا | phrase | welcome
اَلسَّلَامُ عَلَيْكُمْ | phrase | peace be upon you (the everyday greeting)
وَعَلَيْكُمُ السَّلَامُ | phrase | and upon you be peace (the reply)
صَبَاحُ الْخَيْرِ | phrase | good morning
مَسَاءُ الْخَيْرِ | phrase | good evening
تُصْبِحُ عَلَى خَيْرٍ | phrase | good night
مَعَ السَّلَامَةِ | phrase | goodbye
شُكْرًا | intj | thank you
عَفْوًا | intj | you're welcome; excuse me
مِنْ فَضْلِكَ | phrase | please (to a man)
آسِف | adj | sorry
نَعَمْ | particle | yes
لَا | particle | no; not
كَيْفَ حَالُكَ | phrase | how are you? (to a man)
اَلْحَمْدُ لِلّٰهِ | phrase | praise be to God (fine, thank God)
إِنْ شَاءَ اللّٰهُ | phrase | God willing; hopefully
مُمْكِن | adj | possible
طَبْعًا | adv | of course
"""),
("people, pronouns and question words", """
أَنَا | pron | I
أَنْتَ | pron | you (to a man)
أَنْتِ | pron | you (to a woman)
هُوَ | pron | he; it
هِيَ | pron | she; it
نَحْنُ | pron | we
أَنْتُمْ | pron | you (more than one)
هُمْ | pron | they
هٰذَا | pron | this (masculine)
هٰذِهِ | pron | this (feminine)
ذٰلِكَ | pron | that (masculine)
تِلْكَ | pron | that (feminine)
هٰؤُلَاءِ | pron | these
اَلَّذِي | pron | who, which, that (masculine)
اَلَّتِي | pron | who, which, that (feminine)
مَنْ | pron | who?
مَا | pron | what? (before a noun)
مَاذَا | pron | what? (before a verb)
أَيْنَ | adv | where?
مَتَى | adv | when?
كَيْفَ | adv | how?
لِمَاذَا | adv | why?
كَمْ | pron | how many? how much?
أَيّ | pron | which?
هَلْ | particle | (asks a yes-or-no question)
كُلّ | noun | every; all
بَعْض | noun | some
شَيْء | noun | thing; something
أَحَد | noun | someone, anyone
غَيْر | noun | other than; not
"""),
("little words", """
فِي | prep | in
عَلَى | prep | on
إِلَى | prep | to
مِنْ | prep | from
عَنْ | prep | about; from
مَعَ | prep | with
بِ | prep | with, by, in
لِ | prep | for, to
عِنْدَ | prep | at; (with a pronoun) to have
قَبْلَ | prep | before
بَعْدَ | prep | after
تَحْتَ | prep | under
فَوْقَ | prep | above, over
أَمَامَ | prep | in front of
وَرَاءَ | prep | behind
بَيْنَ | prep | between
حَتَّى | prep | until; even
مِثْل | noun | like, similar to
حَوْلَ | prep | around; about
وَ | conj | and
أَوْ | conj | or
لٰكِنْ | conj | but
ثُمَّ | conj | then, after that
فَ | conj | so, and then
إِذَا | conj | if
لِأَنَّ | conj | because
أَنَّ | conj | that
أَنْ | conj | to (before a verb); that
عِنْدَمَا | conj | when (not a question)
أَيْضًا | adv | also, too
جِدًّا | adv | very
فَقَط | adv | only
لَمْ | particle | did not
لَنْ | particle | will not
لَيْسَ | verb | is not
سَوْفَ | particle | will (the future)
قَدْ | particle | already; may
هُنَا | adv | here
هُنَاكَ | adv | there; there is
اَلْآنَ | adv | now
دَائِمًا | adv | always
أَحْيَانًا | adv | sometimes
أَبَدًا | adv | never, ever
كَثِيرًا | adv | a lot, often
قَلِيلًا | adv | a little
مَعًا | adv | together
بَعِيد | adj | far
قَرِيب | adj | near
"""),
("numbers", """
صِفْر | num | zero
وَاحِد | num | one
اِثْنَان | num | two
ثَلَاثَة | num | three
أَرْبَعَة | num | four
خَمْسَة | num | five
سِتَّة | num | six
سَبْعَة | num | seven
ثَمَانِيَة | num | eight
تِسْعَة | num | nine
عَشَرَة | num | ten
أَحَدَ عَشَرَ | num | eleven
اِثْنَا عَشَرَ | num | twelve
عِشْرُون | num | twenty
ثَلَاثُون | num | thirty
أَرْبَعُون | num | forty
خَمْسُون | num | fifty
مِئَة | num | hundred
أَلْف | num | thousand
مَلْيُون | num | million
أَوَّل | adj | first
ثَانٍ | adj | second
ثَالِث | adj | third
آخِر | adj | last
نِصْف | noun | half
رُبْع | noun | quarter
رَقْم | noun | number (a figure)
عَدَد | noun | number, amount
"""),
("time, days and months", """
وَقْت | noun | time
سَاعَة | noun | hour; clock, watch
دَقِيقَة | noun | minute
يَوْم | noun | day
أُسْبُوع | noun | week
شَهْر | noun | month
سَنَة | noun | year
عَام | noun | year (the more formal word)
اَلْيَوْمَ | adv | today
غَدًا | adv | tomorrow
أَمْسِ | adv | yesterday
صَبَاح | noun | morning
مَسَاء | noun | evening
لَيْل | noun | night (the time of darkness)
لَيْلَة | noun | night (one night)
نَهَار | noun | daytime
ظُهْر | noun | noon
اَلْأَحَد | noun | Sunday
اَلِاثْنَيْن | noun | Monday
اَلثُّلَاثَاء | noun | Tuesday
اَلْأَرْبِعَاء | noun | Wednesday
اَلْخَمِيس | noun | Thursday
اَلْجُمْعَة | noun | Friday
اَلسَّبْت | noun | Saturday
عُطْلَة | noun | holiday, day off
عِيد | noun | festival, feast
عِيد مِيلَاد | noun | birthday
صَيْف | noun | summer
شِتَاء | noun | winter
رَبِيع | noun | spring
خَرِيف | noun | autumn
مَوْعِد | noun | appointment
تَارِيخ | noun | date; history
"""),
("family and people", """
عَائِلَة | noun | family
أَب | noun | father
أُمّ | noun | mother
أَخ | noun | brother
أُخْت | noun | sister
اِبْن | noun | son
بِنْت | noun | daughter; girl
وَلَد | noun | boy; child
طِفْل | noun | child
زَوْج | noun | husband
زَوْجَة | noun | wife
جَدّ | noun | grandfather
جَدَّة | noun | grandmother
عَمّ | noun | uncle (father's brother)
خَال | noun | uncle (mother's brother)
عَمَّة | noun | aunt (father's sister)
خَالَة | noun | aunt (mother's sister)
رَجُل | noun | man
اِمْرَأَة | noun | woman
نَاس | noun | people
شَخْص | noun | person
صَدِيق | noun | friend
جَار | noun | neighbour
ضَيْف | noun | guest
اِسْم | noun | name
عُمْر | noun | age; life
شَابّ | noun | young man
"""),
("countries and languages", """
بَلَد | noun | country; town
وَطَن | noun | homeland
دَوْلَة | noun | state, country
مَدِينَة | noun | city
قَرْيَة | noun | village
عَرَبِيّ | adj | Arab; Arabic
لُغَة | noun | language
إِنْجِلِيزِيّ | adj | English
عَاصِمَة | noun | capital (city)
جِنْسِيَّة | noun | nationality
عَالَم | noun | world
"""),
("the body and health", """
جِسْم | noun | body
رَأْس | noun | head
وَجْه | noun | face
عَيْن | noun | eye
أُذُن | noun | ear
أَنْف | noun | nose
فَم | noun | mouth
سِنّ | noun | tooth
شَعْر | noun | hair
يَد | noun | hand
رِجْل | noun | leg; foot
قَلْب | noun | heart
بَطْن | noun | stomach, belly
ظَهْر | noun | back
صِحَّة | noun | health
مَرِيض | adj | ill, sick
مَرَض | noun | illness
طَبِيب | noun | doctor
مُسْتَشْفَى | noun | hospital
صَيْدَلِيَّة | noun | pharmacy, chemist's
دَوَاء | noun | medicine
أَلَم | noun | pain
"""),
("food and drink", """
طَعَام | noun | food
أَكْل | noun | food; eating
مَاء | noun | water
خُبْز | noun | bread
لَحْم | noun | meat
دَجَاج | noun | chicken
سَمَك | noun | fish
أَرُزّ | noun | rice
بَيْض | noun | eggs
جُبْن | noun | cheese
حَلِيب | noun | milk
قَهْوَة | noun | coffee
شَاي | noun | tea
عَصِير | noun | juice
سُكَّر | noun | sugar
مِلْح | noun | salt
فَاكِهَة | noun | fruit
تُفَّاح | noun | apples
بُرْتُقَال | noun | oranges
مَوْز | noun | bananas
بَطَاطِس | noun | potatoes
طَمَاطِم | noun | tomatoes
تَمْر | noun | dates (the fruit)
فُطُور | noun | breakfast
غَدَاء | noun | lunch
عَشَاء | noun | dinner, supper
مَطْعَم | noun | restaurant
مَقْهًى | noun | café
جَائِع | adj | hungry
عَطْشَان | adj | thirsty
لَذِيذ | adj | delicious
كُوب | noun | cup, glass
صَحْن | noun | plate, dish
"""),
("the home", """
بَيْت | noun | house, home
مَنْزِل | noun | home, residence
شَقَّة | noun | flat, apartment
غُرْفَة | noun | room
مَطْبَخ | noun | kitchen
حَمَّام | noun | bathroom
بَاب | noun | door
نَافِذَة | noun | window
طَاوِلَة | noun | table
كُرْسِيّ | noun | chair
سَرِير | noun | bed
مِفْتَاح | noun | key
تِلْفَاز | noun | television
هَاتِف | noun | telephone
حَدِيقَة | noun | garden; park
مَكَان | noun | place
عُنْوَان | noun | address
"""),
("the town and getting about", """
شَارِع | noun | street
طَرِيق | noun | road, way
سُوق | noun | market
مَحَلّ | noun | shop
مَسْجِد | noun | mosque
مَدْرَسَة | noun | school
جَامِعَة | noun | university
مَكْتَب | noun | office; desk
مَكْتَبَة | noun | library; bookshop
فُنْدُق | noun | hotel
بَنْك | noun | bank
مَطَار | noun | airport
مَحَطَّة | noun | station
سَيَّارَة | noun | car
حَافِلَة | noun | bus
قِطَار | noun | train
طَائِرَة | noun | aeroplane
تَاكْسِي | noun | taxi
سَفَر | noun | travel, journey
تَذْكِرَة | noun | ticket
يَمِين | noun | right (the side)
يَسَار | noun | left (the side)
شَمَال | noun | north
جَنُوب | noun | south
شَرْق | noun | east
غَرْب | noun | west
"""),
("shopping and money", """
مَال | noun | money; wealth
سِعْر | noun | price
رَخِيص | adj | cheap
غَالٍ | adj | expensive
دِينَار | noun | dinar
مَلَابِس | noun | clothes
قَمِيص | noun | shirt
حِذَاء | noun | shoe
حَقِيبَة | noun | bag; suitcase
"""),
("school, work and study", """
عَمَل | noun | work, job
طَالِب | noun | student
مُدَرِّس | noun | teacher
مُعَلِّم | noun | teacher, instructor
دَرْس | noun | lesson
صَفّ | noun | class, classroom
كِتَاب | noun | book
قَلَم | noun | pen, pencil
وَرَقَة | noun | sheet of paper
دَفْتَر | noun | notebook, exercise book
سُؤَال | noun | question
جَوَاب | noun | answer
كَلِمَة | noun | word
جُمْلَة | noun | sentence
رِسَالَة | noun | letter; message
حَاسُوب | noun | computer
مُهَنْدِس | noun | engineer
مُوَظَّف | noun | employee, official
شَرِكَة | noun | company, firm
"""),
("the weather and the world around", """
طَقْس | noun | weather
شَمْس | noun | sun
قَمَر | noun | moon
مَطَر | noun | rain
رِيح | noun | wind
ثَلْج | noun | snow; ice
سَمَاء | noun | sky
أَرْض | noun | earth, ground, land
بَحْر | noun | sea
نَهْر | noun | river
جَبَل | noun | mountain
صَحْرَاء | noun | desert
شَجَرَة | noun | tree
زَهْرَة | noun | flower
حَيَوَان | noun | animal
كَلْب | noun | dog
قِطَّة | noun | cat
حِصَان | noun | horse
جَمَل | noun | camel
طَائِر | noun | bird
حَارّ | adj | hot
بَارِد | adj | cold
دَافِئ | adj | warm
"""),
("colours", """
لَوْن | noun | colour
أَبْيَض | adj | white
أَسْوَد | adj | black
أَحْمَر | adj | red
أَخْضَر | adj | green
أَزْرَق | adj | blue
أَصْفَر | adj | yellow
"""),
("describing things", """
كَبِير | adj | big; old (of a person)
صَغِير | adj | small; young
طَوِيل | adj | long; tall
قَصِير | adj | short
جَدِيد | adj | new
قَدِيم | adj | old (of a thing)
جَمِيل | adj | beautiful
جَيِّد | adj | good
سَيِّئ | adj | bad
كَثِير | adj | many, much
قَلِيل | adj | few, little
سَعِيد | adj | happy
حَزِين | adj | sad
صَعْب | adj | difficult
سَهْل | adj | easy
سَرِيع | adj | fast
بَطِيء | adj | slow
مَشْغُول | adj | busy
تَعْبَان | adj | tired
نَظِيف | adj | clean
وَسِخ | adj | dirty
مَفْتُوح | adj | open
مُغْلَق | adj | closed
مُهِمّ | adj | important
صَحِيح | adj | correct, right
خَاصّ | adj | special; private
كَامِل | adj | complete, whole
فَارِغ | adj | empty
ثَقِيل | adj | heavy
خَفِيف | adj | light (not heavy)
غَنِيّ | adj | rich
فَقِير | adj | poor
مَشْهُور | adj | famous
مُخْتَلِف | adj | different
أَفْضَل | adj | better, best
أَكْثَر | adj | more, most
"""),
("everyday verbs", """
كَانَ | verb | to be (in the past); was
قَالَ | verb | to say
ذَهَبَ | verb | to go
جَاءَ | verb | to come
رَأَى | verb | to see
عَرَفَ | verb | to know
أَرَادَ | verb | to want
أَحَبَّ | verb | to love, to like
فَعَلَ | verb | to do
عَمِلَ | verb | to work; to do
أَكَلَ | verb | to eat
شَرِبَ | verb | to drink
كَتَبَ | verb | to write
قَرَأَ | verb | to read
سَمِعَ | verb | to hear
تَكَلَّمَ | verb | to speak
فَهِمَ | verb | to understand
دَرَسَ | verb | to study
تَعَلَّمَ | verb | to learn
عَلَّمَ | verb | to teach
سَأَلَ | verb | to ask
أَجَابَ | verb | to answer
أَعْطَى | verb | to give
أَخَذَ | verb | to take
وَجَدَ | verb | to find
وَضَعَ | verb | to put
فَتَحَ | verb | to open
أَغْلَقَ | verb | to close
دَخَلَ | verb | to enter, to go in
خَرَجَ | verb | to go out, to leave
رَجَعَ | verb | to return, to come back
جَلَسَ | verb | to sit
قَامَ | verb | to stand up; to carry out
نَامَ | verb | to sleep
مَشَى | verb | to walk
سَافَرَ | verb | to travel
وَصَلَ | verb | to arrive
سَكَنَ | verb | to live (somewhere)
عَاشَ | verb | to live, to be alive
اِشْتَرَى | verb | to buy
بَاعَ | verb | to sell
دَفَعَ | verb | to pay; to push
لَعِبَ | verb | to play
نَظَرَ | verb | to look
اِنْتَظَرَ | verb | to wait
سَاعَدَ | verb | to help
اِسْتَطَاعَ | verb | to be able to, can
بَدَأَ | verb | to begin
اِنْتَهَى | verb | to finish, to end
أَحْضَرَ | verb | to bring
حَمَلَ | verb | to carry
لَبِسَ | verb | to put on, to wear
غَسَلَ | verb | to wash
طَبَخَ | verb | to cook
اِسْتَيْقَظَ | verb | to wake up
نَسِيَ | verb | to forget
تَذَكَّرَ | verb | to remember
فَكَّرَ | verb | to think
شَعَرَ | verb | to feel
ضَحِكَ | verb | to laugh
بَكَى | verb | to cry, to weep
اِتَّصَلَ | verb | to phone, to get in touch
زَارَ | verb | to visit
اِسْتَعْمَلَ | verb | to use
بَحَثَ | verb | to look for, to search
مَاتَ | verb | to die
صَارَ | verb | to become
بَقِيَ | verb | to stay, to remain
تَرَكَ | verb | to leave (behind); to let
حَاوَلَ | verb | to try
اِحْتَاجَ | verb | to need
فَضَّلَ | verb | to prefer
كَرِهَ | verb | to hate
خَافَ | verb | to be afraid
رَكِبَ | verb | to ride, to get on
سَبَحَ | verb | to swim
رَسَمَ | verb | to draw
غَنَّى | verb | to sing
قَابَلَ | verb | to meet
أَرْسَلَ | verb | to send
اِسْتَمَعَ | verb | to listen
"""),
("more words for the level", """
حَيَاة | noun | life
حُبّ | noun | love
خَيْر | noun | good, goodness
سَلَام | noun | peace
مُشْكِلَة | noun | problem
فِكْرَة | noun | idea
خَبَر | noun | piece of news
قِصَّة | noun | story
فِيلْم | noun | film
مُوسِيقَى | noun | music
رِيَاضَة | noun | sport
كُرَة | noun | ball
كُرَة الْقَدَمِ | noun | football
لُعْبَة | noun | game; toy
صُورَة | noun | picture, photo
هَدِيَّة | noun | present, gift
حَفْلَة | noun | party
مَرَّة | noun | time (once, twice …)
سَبَب | noun | reason
نَوْع | noun | kind, sort
جُزْء | noun | part
بِدَايَة | noun | beginning
نِهَايَة | noun | end
رَئِيس | noun | president; head, boss
شُرْطَة | noun | police
اَللّٰه | noun | God
نَار | noun | fire
ضَوْء | noun | light
صَوْت | noun | voice; sound
نُقُود | noun | cash, coins
"""),
]


def entries():
    out = []
    for topic, block in TOPICS:
        for line in block.strip().splitlines():
            parts = [p.strip() for p in line.split("|")]
            if len(parts) != 3 or not all(parts):
                raise SystemExit("inventory: bad line in %s: %r" % (topic, line))
            out.append({"head": parts[0], "pos": parts[1], "en": parts[2], "topic": topic})
    return out


if __name__ == "__main__":
    E = entries()
    print(len(E), "lines")
