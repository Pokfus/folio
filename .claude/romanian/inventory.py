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

A2 = [
    ('people and relatives', 'nepot nepoată văr verișoară socru soacră ginere noră logodnic '
                             'logodnică bebeluș adolescent tânăr bătrân pensionar coleg '
                             'șef client musafir străin cetățean'),
    ('jobs and study', 'meserie inginer avocat polițist vânzător bucătar șofer asistent '
                       'funcționar muncitor fermier director secretar programator salariu '
                       'firmă fabrică angajat liceu facultate universitate clasă lecție temă '
                       'examen notă caiet dicționar curs diplomă'),
    ('clothes', 'haină rochie fustă pantalon cămașă bluză tricou pulover geacă palton pantof '
                'cizmă șosetă pălărie căciulă mănușă fular costum curea buzunar mărime '
                'îmbrăca dezbrăca purta'),
    ('food and cooking', 'pui porc vită ceapă usturoi morcov varză castravete salată ardei '
                         'fasole mazăre ciupercă portocală lămâie strugure pară căpșună cireașă '
                         'prăjitură tort ciocolată înghețată biscuit unt ulei miere smântână '
                         'iaurt făină piper sos ciorbă gustare desert farfurie pahar ceașcă '
                         'lingură furculiță cuțit oală tigaie găti fierbe prăji tăia gust '
                         'foame sete delicios gustos dulce sărat acru amar proaspăt'),
    ('the home', 'etaj parter scară balcon grădină perete podea tavan acoperiș hol sufragerie '
                 'mobilă dulap raft canapea fotoliu covor perdea oglindă lampă frigider '
                 'aragaz cuptor mașină_de_spălat duș chiuvetă prosop săpun pernă pătură '
                 'chirie muta curăța spăla'),
    ('the town and its services', 'centru cartier parc muzeu teatru cinema '
                                  'bibliotecă biserică poștă primărie poliție pod colț '
                                  'semafor intersecție trotuar parcare benzinărie supermarket '
                                  'librărie brutărie cafenea bar club hartă'),
    ('travel and holidays', 'călătorie vacanță concediu excursie bagaj valiză pașaport viză '
                            'vamă graniță rezervare cazare turist ghid plajă '
                            'munte mare:noun lac râu insulă pădure câmp deal vale peisaj '
                            'metrou tramvai taxi bicicletă motocicletă vapor port peron '
                            'stație orar întârziere sosire plecare zbor călători rezerva '
                            'vizita'),
    ('nature, seasons and the compass', 'primăvară vară toamnă iarnă anotimp nord sud est vest '
                                        'cer nor stea lună:noun natură copac floare iarbă '
                                        'frunză pământ mediu temperatură grad furtună ceață '
                                        'gheață însorit noros umed uscat'),
    ('animals', 'animal câine pisică cal vacă oaie porc pasăre găină rață urs lup vulpe iepure '
                'șoarece șarpe insectă albină muscă'),
    ('health and the body', 'corp față păr gât umăr braț deget genunchi spate inimă sânge os '
                            'piele sănătate boală răceală tuse gripă rană alergie pastilă '
                            'rețetă consultație programare dentist farmacist urgență ambulanță '
                            'sănătos obosit răni durea tuși vindeca'),
    ('feelings and character', 'bucurie tristețe frică furie dragoste speranță surpriză '
                               'supărat nervos calm liniștit vesel timid curajos leneș '
                               'harnic deștept amabil politicos sincer generos răbdător '
                               'gelos mândru plictisit îngrijorat speria enerva supăra'),
    ('free time and sport', 'timp_liber hobby sport fotbal tenis baschet înot meci echipă '
                            'jucător minge concert muzică cântec film spectacol expoziție '
                            'fotografie desen joc petrecere invitație cadou aniversare '
                            'zi_de_naștere sărbătoare paște nuntă dansa cânta înota '
                            'alerga picta desena invita sărbători distra'),
    ('time and sequence', 'trecut viitor prezent secol deceniu dată calendar ceas alaltăieri '
                          'poimâine curând recent imediat odată între_timp '
                          'în_sfârșit în_curând de_obicei des rar zilnic '
                          'săptămânal lunar anual'),
    ('numbers and quantity', 'patruzeci cincizeci șaizeci șaptezeci optzeci nouăzeci '
                             'treisprezece cincisprezece miliard sfert dublu kilogram '
                             'gram litru metru kilometru centimetru bucată pachet sticlă cutie '
                             'pereche grup număr'),
    ('everyday verbs', 'aprinde stinge urca coborî intra ieși traversa întoarce porni opri '
                       'conduce parca pierde câștiga împrumuta trimite primi suna răspunde '
                       'explica repeta traduce alege decide hotărî promite uita aminti '
                       'gândi visa spera crește naște muri mulțumi saluta întâlni cunoaște '
                       'arăta împărți schimba repara construi strica păstra ascunde arunca '
                       'pregăti comanda servi gusta ajuta lucra odihni plimba relaxa '
                       'grăbi întârzia'),
]

INVENTORY = {'a1': A1, 'a2': A2}
