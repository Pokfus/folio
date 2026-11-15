#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Norwegian word list was found published (see `norwegian_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found there is
reported and dropped, never invented a meaning) and tops the level up with the
commonest remaining words.  The Swedish A1 inventory's topics, in Bokmål.

A word may carry a part of speech after a colon (`en:article`) where the spelling
is shared and the level wants one reading first.  An underscore joins a multi-word
entry (`god_morgen`).  Spellings are Wiktionary's Bokmål headwords: a verb by its
infinitive (`spise`; the modals `kunne`, `ville`, `skulle`, `måtte`), a noun in
the indefinite singular (a plural-only noun in the plural: `penger`), an adjective
in its masculine/feminine form.
"""

A1 = [
    ('pronouns', 'jeg du han hun den:pron det:pron vi dere de:pron man:pron meg deg ham henne oss dem '
                 'seg min:det din:det hans hennes vår:det deres sin:det'),
    ('articles', 'en:article'),
    ('questions', 'hva hvem hvor:adv når:adv hvorfor hvordan hvilken'),
    ('prepositions and place words', 'i på:prep til:prep fra med:prep uten:prep for:prep av:prep '
                                     'om:prep under:prep over:prep etter:prep før:prep hos ved:prep '
                                     'mellom foran bak:prep her der hjem hjemme ute inne opp ned '
                                     'bort nær'),
    ('conjunctions and little words', 'og eller men at:conj som fordi så ikke ja nei jo også bare '
                                      'mye litt kanskje alltid aldri ofte av_og_til allerede igjen '
                                      'nå da snart'),
    ('greetings and politeness', 'hei hallo ha_det takk vær_så_god unnskyld beklager god_morgen '
                                 'god_natt velkommen grei'),
    ('numbers', 'null:num to tre fire fem seks sju åtte ni ti elleve tolv tjue tretti femti hundre '
                'tusen:num første annen tredje halv'),
    ('time', 'tid time minutt dag natt morgen kveld ettermiddag i_dag i_morgen i_går uke måned år '
             'klokke tidlig sen:adj'),
    ('days', 'mandag tirsdag onsdag torsdag fredag lørdag søndag'),
    ('months', 'januar februar mars april mai juni juli august september oktober november '
               'desember'),
    ('family', 'familie mamma pappa mor far bror søster sønn datter kvinne kone mann:noun barn '
               'gutt jente bestemor bestefar venn venninne baby'),
    ('people and yourself', 'navn alder land by:noun språk norsk:noun engelsk:noun arbeid jobb elev '
                            'student lærer lege menneske person'),
    ('food and drink', 'mat vann kaffe te melk brød vin øl ost kjøtt fisk egg frukt eple appelsin '
                       'tomat salat sukker salt frokost lunsj middag potet ris smør is:noun'),
    ('shopping and money', 'penger krone pris butikk kjøpe selge betale koste billig dyr:adj'),
    ('the home', 'hus leilighet rom dør vindu bord stol seng kjøkken bad toalett bok penn telefon '
                 'nøkkel'),
    ('the town and getting about', 'gate vei bil buss tog taxi billett stasjon hotell sykehus '
                                   'skole kontor bank høyre venstre rett flyplass hav '
                                   'restaurant apotek sykkel'),
    ('the body and feeling ill', 'hode øye øre nese munn hånd arm:noun bein fot mage tann syk frisk '
                                 'vond medisin feber'),
    ('weather', 'vær:noun varm kald regn sol vind snø regne'),
    ('colours', 'farge rød blå gul grønn svart hvit brun'),
    ('describing', 'stor liten ny gammel ung fin bra dårlig glad trist lang kort lett vanskelig '
                   'mange all hel hver ingenting trøtt sulten'),
    ('everyday verbs', 'være ha gjøre gå komme spise drikke:verb sove våkne sitte se høre snakke si lese '
                       'skrive forstå vite kunne ville skulle måtte få:verb bo:verb hete:verb synes like '
                       'åpne lukke spørre svare tenke elske arbeide jobbe lære:verb lytte ta gi kjøre '
                       'reise:verb hjelpe finne:verb'),
]

INVENTORY = {'a1': A1}
