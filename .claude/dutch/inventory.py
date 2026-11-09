#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Dutch word list was found published (see `dutch_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`een:article`) where the
spelling is shared and the level wants one reading first; an underscore joins a
multi-word entry (`tot_ziens`).  Spellings are Wiktionary's headwords: a verb
by its infinitive (`eten`), a noun in the singular, an adjective in its
uninflected form.
"""

A1 = [
    ('pronouns', 'ik jij je hij zij ze wij we jullie u mij me jou hem haar ons hun mijn jouw '
                 'zijn:verb'),
    ('articles and pointing words', 'de het een:article dit dat:pron deze die'),
    ('questions', 'wat wie waar wanneer waarom hoe hoeveel welk'),
    ('prepositions and place words', 'in op aan met van voor na naar uit bij onder over tussen naast '
                                     'achter zonder tot door om hier daar binnen buiten links rechts '
                                     'rechtdoor dichtbij ver boven beneden'),
    ('small words', 'en of maar want omdat als dan niet geen ja nee heel erg ook alleen nog al '
                    'even wel misschien er zo te'),
    ('greetings and politeness', 'hallo hoi dag goedemorgen goedemiddag goedenavond welterusten '
                                 'bedankt dankjewel alsjeblieft alstublieft sorry pardon doei '
                                 'tot_ziens graag'),
    ('numbers', 'nul één twee drie vier vijf zes zeven acht negen tien elf twaalf twintig dertig '
                'veertig vijftig honderd duizend eerste tweede derde half'),
    ('time', 'tijd uur minuut dag nacht ochtend morgen middag avond vandaag gisteren nu straks '
             'later week weekend maand jaar vroeg laat altijd nooit vaak soms'),
    ('days', 'maandag dinsdag woensdag donderdag vrijdag zaterdag zondag'),
    ('months', 'januari februari maart april mei juni juli augustus september oktober november '
               'december'),
    ('family', 'familie gezin moeder mama vader papa ouder broer zus zoon dochter man vrouw kind '
               'baby jongen meisje opa oma oom tante vriend vriendin'),
    ('people and yourself', 'naam leeftijd land stad dorp taal Nederlands:noun Engels:noun werk leerling '
                            'student leraar dokter mens meneer mevrouw adres'),
    ('food and drink', 'water koffie thee melk brood wijn bier kaas vlees vis ei fruit appel '
                       'sinaasappel tomaat salade suiker zout ontbijt lunch avondeten aardappel '
                       'rijst boter groente'),
    ('shopping and money', 'geld euro prijs winkel markt supermarkt goedkoop duur kopen betalen '
                           'geven krijgen nemen'),
    ('the home', 'huis kamer deur raam tafel stoel bed keuken badkamer toilet boek pen telefoon '
                 'sleutel appartement'),
    ('the town and getting about', 'straat weg auto bus trein taxi fiets kaartje station hotel '
                                   'ziekenhuis school kantoor bank vliegveld zee restaurant '
                                   'apotheek plein'),
    ('the body and feeling ill', 'hoofd oog oor neus mond hand arm voet been buik rug tand ziek '
                                 'pijn medicijn koorts'),
    ('weather', 'weer zon regen wind sneeuw warm koud regenen'),
    ('colours', 'kleur rood blauw geel groen zwart wit oranje bruin'),
    ('describing', 'groot klein nieuw oud jong mooi lelijk slecht goed blij lang kort makkelijk '
                   'moeilijk veel weinig alle elk iets niets iemand niemand leuk lekker'),
    ('everyday verbs', 'hebben doen gaan komen eten drinken slapen zitten staan liggen zien horen '
                       'praten spreken zeggen lezen schrijven begrijpen weten kennen willen kunnen '
                       'moeten mogen wonen lopen vinden openen sluiten vragen denken houden werken '
                       'leren maken kijken wachten worden opstaan heten zoeken helpen'),
]

INVENTORY = {'a1': A1}
