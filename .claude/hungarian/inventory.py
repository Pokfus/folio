#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Hungarian word list was found published (see `hungarian_level.py`),
so a level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`fog:noun`) where one
spelling is two words and the level wants one reading first; an underscore is a
space (`jó_reggelt`).  Spellings are Wiktionary's headwords: a verb by its
third person singular present, the form Hungarian dictionaries list (`eszik`
"eats", `lát` "sees"), a noun and an adjective in the nominative singular.  An
alternative spelling Wiktionary files under another headword (`hová` for
`hova`) resolves through it, and the card prints the spelling written here.
"""

A1 = [
    ('pronouns', 'én te ő mi ti ők maga ön ez az'),
    ('articles', 'a egy:article'),
    ('questions', 'mi ki hol hova honnan mikor miért hogyan hány mennyi melyik milyen'),
    ('postpositions and place words', 'alatt felett mellett előtt mögött között után nélkül '
                                      'itt ott bent kint fent közel messze jobbra balra egyenesen'),
    ('conjunctions and particles', 'és vagy:conj de:conj hogy:conj mert ha is nem igen ne sem csak már még nagyon '
                                   'talán persze nincs'),
    ('greetings and politeness', 'szia szervusz helló jó_reggelt jó_napot jó_estét jó_éjszakát '
                                 'viszlát köszönöm kösz kérem bocsánat elnézést tessék'),
    ('numbers', 'egy:num kettő két három négy öt hat hét nyolc kilenc tíz tizenegy húsz harminc '
                'negyven ötven száz ezer első második harmadik fél'),
    ('time', 'idő óra perc nap éjszaka reggel este délután délelőtt dél ma holnap tegnap most '
             'majd hónap év korán későn mindig soha gyakran'),
    ('days', 'hétfő kedd szerda csütörtök péntek szombat vasárnap'),
    ('months', 'január február március április május június július augusztus szeptember '
               'október november december'),
    ('family', 'család anya apa anyuka testvér báty öcs nővér húg fiú lány férj feleség nagymama '
               'nagypapa gyerek baba barát barátnő férfi nő'),
    ('people and yourself', 'név kor ország város falu nyelv magyar angol munka diák tanár orvos '
                            'ember úr hölgy'),
    ('food and drink', 'étel víz kávé tea tej kenyér bor sör sajt hús hal tojás gyümölcs alma '
                       'narancs paradicsom saláta cukor só reggeli ebéd vacsora krumpli rizs leves vaj'),
    ('shopping and money', 'pénz forint euró ár bolt üzlet piac olcsó drága vesz elad fizet ad kap'),
    ('the home', 'ház lakás szoba ajtó ablak asztal szék ágy konyha fürdőszoba könyv toll telefon '
                 'kulcs'),
    ('the town and getting about', 'utca út autó busz vonat taxi jegy állomás szálloda kórház '
                                   'iskola iroda bank étterem gyógyszertár repülőtér tenger'),
    ('the body and feeling ill', 'fej szem fül orr száj kéz láb has fog:noun beteg fáj gyógyszer láz'),
    ('weather', 'időjárás meleg hideg eső szél hó esik süt'),
    ('colours', 'szín piros kék sárga zöld fekete fehér barna szürke'),
    ('describing', 'nagy kicsi kis új régi szép jó rossz boldog magas alacsony könnyű nehéz sok '
                   'kevés minden egész valami semmi valaki senki'),
    ('everyday verbs', 'van lesz csinál megy jön eszik iszik alszik felkel ül lát néz hall beszél '
                       'mond olvas ír ért tud akar szeret tetszik lakik él sétál talál kinyit becsuk '
                       'kérdez gondol dolgozik tanul kér kell vár'),
]

INVENTORY = {'a1': A1}
