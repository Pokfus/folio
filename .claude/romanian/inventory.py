#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No openly licensed graded Romanian word list was found (see `ro_level.py`), so
a level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`bun:adj`) where the spelling
is shared and the level wants one reading first.  Verbs are written as their
Wiktionary headword, the bare infinitive (`face`; the card prints `a face`).
Multi-word entries join with `_`.  Spellings use the comma-below ș and ț;
matching goes through `ro.fold`, so a cedilla resolves too.
"""

A1 = [
    ('pronouns', 'eu tu el ea noi voi ei ele dumneavoastră dumneata meu tău său nostru vostru '
                 'acesta acela ăsta ăla cineva ceva nimeni nimic fiecare tot:det alt'),
    ('articles', 'un al:article'),
    ('questions', 'ce cine unde când cum cât care de_ce'),
    ('prepositions', 'în la de:prep din cu fără pe pentru despre până după înainte lângă sub peste '
                     'între prin spre de_la'),
    ('conjunctions and particles', 'și sau dar că dacă pentru_că deci nu da mai:adv foarte doar '
                                   'chiar încă deja'),
    ('greetings and politeness', 'salut bună_ziua bună_seara noapte_bună la_revedere mulțumesc '
                                 'vă_rog te_rog scuze pardon poftim'),
    ('numbers', 'zero unu doi trei patru cinci șase șapte opt nouă zece unsprezece doisprezece '
                'douăzeci treizeci sută mie milion prim jumătate'),
    ('time', 'timp oră minut secundă zi noapte dimineață seară prânz azi astăzi ieri mâine acum '
             'apoi atunci mereu niciodată uneori devreme târziu săptămână lună an weekend'),
    ('days and months', 'luni marți miercuri joi vineri sâmbătă duminică ianuarie februarie martie '
                        'aprilie iunie iulie august septembrie octombrie noiembrie decembrie'),
    ('family', 'familie mamă tată părinte frate soră fiu fiică soț soție bunic bunică copil băiat '
               'fată bărbat femeie om prieten prietenă unchi mătușă'),
    ('people and yourself', 'nume vârstă țară oraș sat limbă română engleză muncă serviciu elev '
                            'student profesor doctor vecin:noun adresă'),
    ('food and drink', 'mâncare apă ceai cafea lapte pâine orez carne pește ou brânză legumă fruct '
                       'măr banană cartof roșie supă sare zahăr bere vin suc mic_dejun prânz cină '
                       'restaurant meniu'),
    ('shopping and money', 'ban leu euro preț magazin piață ieftin scump cumpăra vinde plăti costa '
                           'card'),
    ('the home', 'casă apartament cameră bucătărie baie dormitor ușă fereastră masă scaun pat '
                 'carte pix telefon cheie:noun calculator televizor'),
    ('the town and getting about', 'stradă drum mașină autobuz tren avion bilet gară aeroport '
                                   'hotel spital școală birou bancă farmacie stânga dreapta '
                                   'departe aproape drept:adv aici acolo'),
    ('the body and feeling ill', 'cap ochi ureche nas gură mână picior stomac dinte bolnav durere '
                                 'medicament febră'),
    ('weather', 'vreme soare ploaie zăpadă vânt cald frig rece'),
    ('colours', 'culoare roșu albastru galben verde negru alb gri maro'),
    ('describing', 'mare mic nou vechi frumos urât bun:adj rău:adj fericit trist lung scurt '
                   'ușor greu mult puțin cald interesant liber ocupat'),
    ('everyday verbs', 'fi avea face merge veni vrea putea trebui ști cunoaște mânca bea dormi '
                       'trezi sta locui lucra învăța citi scrie vorbi spune întreba răspunde '
                       'înțelege vedea auzi asculta privi deschide închide începe termina lua da '
                       'pleca ajunge aștepta căuta găsi iubi plăcea dori chema numi'),
]

INVENTORY = {'a1': A1}
