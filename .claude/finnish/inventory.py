#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Finnish word list was found published (see `finnish_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`kuusi:num`) where one spelling
is two words and the level wants one reading first; an underscore is a space
(`hyvää_huomenta`).  Spellings are Wiktionary's headwords: a verb by its first
infinitive, the form Finnish dictionaries list (`syödä` "to eat", `puhua` "to
speak"), a noun and an adjective in the nominative singular.
"""

A1 = [
    ('pronouns', 'minä sinä hän me te he se ne tämä tuo joka kuka mikä'),
    ('questions', 'missä mihin mistä milloin miksi miten kuinka paljonko montako kumpi millainen'),
    ('postpositions and place words', 'alla päällä vieressä edessä takana välissä jälkeen ennen '
                                      'ilman kanssa luona täällä tuolla siellä sisällä ulkona '
                                      'lähellä kaukana oikealle vasemmalle suoraan'),
    ('conjunctions and particles', 'ja tai mutta että koska jos myös ei kyllä joo vain jo vielä '
                                   'hyvin erittäin todella ehkä tietysti nyt sitten'),
    ('greetings and politeness', 'hei moi terve huomenta hyvää_huomenta hyvää_päivää hyvää_iltaa '
                                 'hyvää_yötä näkemiin kiitos kiitti anteeksi ole_hyvä tervetuloa '
                                 'hauska_tutustua'),
    ('numbers', 'nolla yksi kaksi kolme neljä viisi kuusi:num seitsemän kahdeksan yhdeksän '
                'kymmenen sata tuhat ensimmäinen toinen kolmas puoli numero'),
    ('time', 'aika tunti minuutti päivä yö aamu ilta iltapäivä keskipäivä tänään huomenna '
             'eilen viikko kuukausi vuosi aikaisin myöhään aina koskaan usein joskus kello'),
    ('days', 'maanantai tiistai keskiviikko torstai perjantai lauantai sunnuntai viikonloppu'),
    ('months', 'tammikuu helmikuu maaliskuu huhtikuu toukokuu kesäkuu heinäkuu elokuu '
               'syyskuu lokakuu marraskuu joulukuu'),
    ('seasons', 'kevät kesä syksy talvi'),
    ('family', 'perhe äiti isä veli sisko sisar poika tytär mies vaimo isoäiti isoisä mummo '
               'lapsi vauva ystävä kaveri nainen tyttö vanhempi'),
    ('people and yourself', 'nimi ikä maa kaupunki kylä kieli suomi englanti työ opiskelija '
                            'opettaja lääkäri ihminen herra rouva osoite'),
    ('food and drink', 'ruoka vesi kahvi tee maito leipä viini olut juusto liha kala '
                       'kana muna hedelmä omena appelsiini tomaatti salaatti sokeri suola '
                       'aamiainen lounas päivällinen peruna riisi keitto voi:noun jäätelö '
                       'kakku mehu'),
    ('shopping and money', 'raha euro hinta kauppa tori halpa kallis ostaa myydä maksaa antaa '
                           'saada kortti'),
    ('the home', 'talo koti asunto huone ovi ikkuna pöytä tuoli sänky keittiö kylpyhuone '
                 'sauna kirja kynä puhelin avain'),
    ('the town and getting about', 'katu tie auto bussi juna taksi lippu asema hotelli '
                                   'sairaala koulu toimisto pankki ravintola apteekki '
                                   'lentokenttä meri järvi metsä'),
    ('the body and feeling ill', 'pää silmä korva nenä suu käsi jalka vatsa hammas sairas '
                                 'sattua lääke kuume'),
    ('weather', 'sää lämmin kylmä sade tuuli lumi aurinko sataa paistaa'),
    ('colours', 'väri punainen sininen keltainen vihreä musta valkoinen ruskea harmaa'),
    ('describing', 'iso suuri pieni uusi vanha kaunis hyvä huono iloinen pitkä lyhyt helppo '
                   'vaikea paljon vähän kaikki joku jokin mikään kukaan kiva'),
    ('everyday verbs', 'olla tulla mennä tehdä syödä juoda nukkua herätä istua nähdä katsoa '
                       'kuulla puhua sanoa lukea kirjoittaa ymmärtää tietää osata haluta '
                       'rakastaa tykätä asua elää kävellä löytää avata sulkea kysyä ajatella '
                       'opiskella oppia pyytää täytyä odottaa voida'),
]

A2 = [
    ('people and relatives', 'serkku setä eno täti isovanhempi vanhempi:noun sukulainen anoppi appi '
                             'miniä vävy sulhanen morsian nuori teini aikuinen eläkeläinen työkaveri '
                             'pomo vieras asiakas naapuri ulkomaalainen lapsenlapsi'),
    ('jobs and study', 'ammatti insinööri asianajaja poliisi myyjä kokki kuljettaja sairaanhoitaja '
                       'tarjoilija sihteeri työntekijä johtaja palkka yritys tehdas työpaikka '
                       'yliopisto lukio luokka oppitunti läksy koe tentti vihko sanakirja kurssi '
                       'tutkinto kokous'),
    ('clothes', 'vaate hame housut paita pusero villapaita takki kenkä saappaat sukka '
                'hattu pipo hanska käsine huivi puku vyö tasku koko:noun pukea riisua pukeutua '
                'farkut mekko'),
    ('food and cooking', 'sianliha naudanliha sipuli valkosipuli porkkana kaali kurkku paprika '
                         'papu herne sieni sitruuna viinirypäle päärynä mansikka kirsikka banaani '
                         'pulla suklaa keksi öljy hunaja jogurtti jauho pippuri kastike jälkiruoka '
                         'lautanen lasi kuppi lusikka haarukka veitsi kattila pannu '
                         'leikata maku nälkä jano herkullinen makea suolainen hapan karvas tuore '
                         'voileipä puuro marja'),
    ('the home', 'kerros porras parveke puutarha seinä lattia katto eteinen olohuone '
                 'makuuhuone huonekalu kaappi hylly sohva nojatuoli matto verho peili lamppu '
                 'jääkaappi liesi uuni pesukone suihku pesuallas pyyhe saippua tyyny peitto '
                 'vuokra muuttaa siivota pestä imuroida'),
    ('the town and its services', 'keskusta kaupunginosa puisto museo teatteri elokuvateatteri kirjasto '
                                  'kirkko posti kaupungintalo poliisiasema silta kulma liikennevalo '
                                  'jalkakäytävä parkkipaikka huoltoasema tavaratalo leipomo kahvila '
                                  'baari aukio kartta kioski'),
    ('travel and holidays', 'matkustaa loma lomamatka retki laukku matkalaukku passi viisumi tulli '
                            'raja majoitus turisti opas ranta vuori joki saari laiva lentokone '
                            'lentää varata varaus vuokrata mökki teltta matkalippu aikataulu '
                            'lähtö saapua myöhästyä pysäkki'),
    ('nature, seasons and the compass', 'luonto taivas pilvi tähti kuu ilma maisema kukka puu ruoho '
                                        'lehti kivi hiekka jää myrsky ukkonen sumu pakkanen aste '
                                        'pohjoinen etelä itä länsi pimeä valoisa märkä kuiva'),
    ('animals', 'eläin koira kissa hevonen lehmä sika lammas lintu kärpänen hyttynen karhu susi '
                'kettu jänis hiiri poro hirvi orava kana:noun kukko ankka'),
    ('health and the body', 'terveys keho iho hius kaula olkapää selkä rinta polvi sormi varvas '
                            'sydän veri flunssa yskä nuha kipu haava vamma lääkäriasema hammaslääkäri '
                            'resepti särkeä yskiä levätä parantua väsynyt'),
    ('feelings and character', 'tunne onnellinen surullinen vihainen pelko ilo suru rakkaus '
                               'ystävällinen tyhmä viisas laiska ahkera rohkea ujo kohtelias '
                               'hermostunut yllättynyt huolestunut tylsä hauskuus kateellinen '
                               'ylpeä rauhallinen'),
    ('free time and sport', 'harrastus vapaa-aika urheilu jalkapallo jääkiekko hiihtää luistella uida '
                            'juosta pelata peli laulaa tanssia musiikki elokuva konsertti näyttely '
                            'valokuva piirtää maalata kalastaa marjastaa kuntosali pyörä'),
    ('time and sequence', 'sekunti vuosisata menneisyys tulevaisuus nykyään ennen:adv '
                          'aluksi lopuksi ensin äsken pian:adv kerran viime ensi seuraava edellinen '
                          'loppu alku keskellä aamupäivä yöllä'),
    ('numbers and quantity', 'yksitoista kaksitoista kaksikymmentä kolmekymmentä viisikymmentä '
                             'miljoona puolet neljännes pari:noun kilo gramma litra metri kilometri '
                             'senttimetri prosentti tarpeeksi lisää muutama monta kumpikin '
                             'molemmat jokainen'),
    ('everyday verbs', 'herättää nousta nostaa pudota kaatua kantaa työntää vetää heittää ottaa_kiinni '
                       'auttaa tarjota lainata korjata rikkoa siivota valmistaa keittää paistaa '
                       'tilata vaihtaa käyttää tarkistaa täyttää ilmoittaa kertoa selittää '
                       'toivoa unelmoida muistuttaa päättää valita yrittää onnistua epäonnistua '
                       'vierailla tavata soittaa vastata kiittää tervehtiä hymyillä nauraa itkeä '
                       'huutaa riidellä'),
]

INVENTORY = {'a1': A1, 'a2': A2}
