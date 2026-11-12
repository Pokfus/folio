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

A2 = [
    ('people and relatives', 'neef nicht kleinkind kleinzoon kleindochter schoonmoeder schoonvader '
                             'echtgenoot echtgenote partner tweeling buurman buurvrouw collega baas '
                             'klant gast vreemdeling tiener volwassene bejaarde'),
    ('jobs and study', 'beroep baan ingenieur advocaat agent verkoper kok chauffeur verpleegster '
                       'secretaresse boer kapper monteur directeur salaris bedrijf fabriek '
                       'sollicitatie vergadering universiteit klas les huiswerk examen toets '
                       'cijfer schrift woordenboek cursus diploma studeren slagen'),
    ('clothes', 'kleren kleding jas jurk rok broek overhemd bloes trui shirt schoen laars sok '
                'hoed muts handschoen sjaal pak riem zak maat aankleden uitkleden dragen '
                'aantrekken uittrekken passen'),
    ('food and cooking', 'kip varkensvlees rundvlees ui knoflook wortel kool komkommer paprika '
                         'boon erwt champignon citroen druif peer aardbei kers banaan taart koek '
                         'chocolade ijs koekje olie honing yoghurt meel peper saus soep '
                         'toetje bord glas kopje lepel vork mes pan koken bakken snijden smaak '
                         'honger dorst zoet zuur bitter vers'),
    ('the home', 'verdieping trap balkon tuin muur vloer plafond dak gang woonkamer slaapkamer '
                 'meubel kast plank lamp koelkast fornuis oven wasmachine '
                 'douche wastafel handdoek zeep kussen deken huur verhuizen schoonmaken wassen'),
    ('the town and its services', 'centrum wijk park museum theater bioscoop bibliotheek kerk '
                                  'postkantoor gemeente politie brug hoek stoplicht kruispunt '
                                  'stoep parkeerplaats tankstation bakker slager boekwinkel '
                                  'café kaart'),
    ('travel and holidays', 'reis vakantie uitstapje bagage koffer paspoort grens reservering '
                            'toerist gids strand berg meer:noun rivier eiland bos veld heuvel '
                            'metro tram boot vliegtuig haven perron halte dienstregeling '
                            'vertraging aankomst vertrek vlucht reizen reserveren bezoeken '
                            'kamperen'),
    ('nature, seasons and the compass', 'lente voorjaar zomer herfst najaar winter seizoen noorden '
                                        'zuiden oosten westen lucht wolk ster maan natuur boom '
                                        'bloem gras blad aarde milieu temperatuur graad storm mist '
                                        'ijs:noun zonnig bewolkt nat droog'),
    ('animals', 'dier hond kat paard koe schaap varken vogel eend beer wolf vos konijn '
                'muis slang insect bij vlieg'),
    ('health and the body', 'lichaam gezicht haar:noun nek schouder vinger knie hart bloed bot huid '
                            'gezondheid ziekte verkoudheid hoest griep wond allergie pil recept '
                            'afspraak tandarts huisarts spoed ambulance gezond moe hoesten '
                            'genezen'),
    ('feelings and character', 'vreugde verdriet angst woede liefde hoop verrassing boos '
                               'zenuwachtig rustig vrolijk verlegen dapper lui slim aardig '
                               'beleefd eerlijk geduldig jaloers trots bang verdrietig '
                               'tevreden bezorgd schrikken'),
    ('free time and sport', 'vrije_tijd hobby sport voetbal tennis zwemmen wedstrijd team speler '
                            'bal concert muziek lied film voorstelling tentoonstelling foto '
                            'tekening spel feest uitnodiging cadeau verjaardag kerst '
                            'bruiloft dansen zingen fietsen schilderen tekenen uitnodigen vieren '
                            'spelen'),
    ('time and sequence', 'verleden toekomst eeuw datum kalender klok horloge eergisteren '
                          'overmorgen binnenkort onlangs meteen ooit intussen eindelijk '
                          'meestal dagelijks wekelijks jaarlijks vorig volgend'),
    ('numbers and quantity', 'zestig zeventig tachtig negentig dertien vijftien miljoen miljard '
                             'kwart dubbel kilo gram liter meter kilometer centimeter stuk pakje '
                             'fles doos paar groep nummer aantal'),
    ('everyday verbs', 'aandoen uitdoen aanzetten uitzetten binnenkomen weggaan oversteken '
                       'terugkomen beginnen stoppen rijden parkeren verliezen winnen lenen '
                       'sturen ontvangen bellen antwoorden uitleggen herhalen vertalen kiezen '
                       'beslissen beloven vergeten herinneren dromen hopen groeien sterven '
                       'bedanken ontmoeten tonen delen veranderen repareren bouwen bewaren '
                       'verstoppen gooien klaarmaken bestellen proeven rusten wandelen '
                       'ontspannen haasten afspreken invullen gebruiken proberen'),
]

B1 = [
    ('work and career', 'werkgever werknemer werkloosheid werkloos vacature ervaring opleiding '
                        'carrière contract ontslag pensioen loon belasting kantoorbaan stage '
                        'functie afdeling ondernemer organisatie overleg rapport verslag project '
                        'doel resultaat succesvol solliciteren ontslaan verdienen samenwerken '
                        'leiden regelen plannen:verb'),
    ('education', 'onderwijs basisschool middelbare_school hogeschool opleiding vak onderwerp '
                  'docent professor scriptie onderzoek kennis vaardigheid niveau inschrijving '
                  'beurs aanwezig afwezig zakken:verb inschrijven oefenen'),
    ('media and communication', 'krant tijdschrift artikel journalist nieuwsbericht programma '
                                'omroep zender reclame advertentie internet website e-mail '
                                'wachtwoord account bericht scherm apparaat toetsenbord '
                                'downloaden uploaden printen opslaan versturen verbinding '
                                'mening discussie gesprek interview'),
    ('society and politics', 'maatschappij samenleving regering overheid minister politiek '
                             'partij verkiezing burger wet regel recht:noun rechter rechtbank '
                             'misdaad dief boete demonstratie vrijheid gelijkheid armoede '
                             'rijkdom werkloosheid economie inwoner bevolking cultuur traditie '
                             'godsdienst geloof stemmen:verb kiezen verbieden toestaan'),
    ('environment and the natural world', 'klimaat milieu vervuiling afval energie zonne-energie '
                                          'recyclen landschap kust woestijn oerwoud vulkaan '
                                          'aardbeving overstroming droogte dijk polder kanaal '
                                          'plant zaad oogst beschermen vervuilen verspillen'),
    ('housing and living', 'woning huurder verhuurder eigenaar hypotheek buurt omgeving '
                           'voorstad platteland nutsvoorzieningen verwarming elektriciteit '
                           'gas:noun rekening stopcontact lekkage onderhoud inrichten '
                           'opruimen stofzuigen strijken'),
    ('health and wellbeing', 'arts specialist operatie behandeling onderzoek:noun bloeddruk '
                             'verzekering zorgverzekering ziekenhuisopname ongeval letsel '
                             'stress depressie dieet gewicht beweging conditie slaapgebrek '
                             'herstellen verzorgen ontspannen afvallen aankomen roken '
                             'vermoeid gewond zwanger'),
    ('travel and transport', 'reisbureau accommodatie camping jeugdherberg excursie '
                             'bezienswaardigheid route snelweg file verkeer ongeluk:noun '
                             'rijbewijs benzine tank:noun spits overstappen instappen uitstappen '
                             'ophalen wegbrengen omleiding'),
    ('money and shopping', 'bankrekening pinpas creditcard contant korting aanbieding bon '
                           'garantie ruilen terugbetalen besparen sparen uitgeven lenen schuld:noun '
                           'budget kosten:noun winst verlies'),
    ('relationships and feelings', 'relatie vriendschap verhouding ruzie scheiding '
                                   'jaloezie medelijden schaamte schuldgevoel teleurstelling '
                                   'opluchting nieuwsgierig teleurgesteld opgelucht eenzaam '
                                   'verveeld geïnteresseerd onzeker zelfverzekerd gevoelig '
                                   'vertrouwen:noun respect steun ruziemaken scheiden '
                                   'kennismaken missen waarderen'),
    ('opinions and argument', 'mening standpunt argument reden gevolg oorzaak voordeel nadeel '
                              'probleem oplossing mogelijkheid voorstel kritiek conclusie '
                              'eens oneens volgens bovendien echter daarom dus toch namelijk '
                              'hoewel ondanks zowel noch ofwel enerzijds anderzijds '
                              'eigenlijk blijkbaar natuurlijk zeker vermoedelijk '
                              'beweren overtuigen vergelijken bespreken toegeven twijfelen '
                              'aanraden adviseren'),
    ('describing things and people', 'eigenschap karakter uiterlijk lengte breedte gewicht:noun '
                                     'vorm materiaal hout metaal plastic papier stof:noun '
                                     'zacht hard:adj glad ruw smal breed ondiep zwaar licht:adj '
                                     'ouderwets modern handig nuttig nutteloos noodzakelijk '
                                     'geschikt ideaal gewoon bijzonder typisch'),
    ('culture and free time', 'kunst kunstenaar schilderij beeld tentoonstelling roman '
                              'schrijver gedicht toneel acteur regisseur publiek orkest '
                              'instrument gitaar piano vereniging lid:noun clubhuis wandeling '
                              'fietstocht festival optreden uitgaan optreden:verb'),
    ('verbs of change and process', 'ontwikkelen verbeteren verminderen vermeerderen toenemen '
                                    'afnemen stijgen dalen ontstaan voorkomen vermijden '
                                    'veroorzaken bereiken bepalen beïnvloeden ondersteunen '
                                    'organiseren voorbereiden afronden doorgaan ophouden '
                                    'opgeven aanpassen vervangen voorzien zorgen omgaan '
                                    'deelnemen meedoen bijdragen'),
]

B2 = [
    ('work, business and the economy', 'arbeidsmarkt sector branche concurrentie concurrent markt '
                                       'handel export import investering investeerder aandeel '
                                       'aandeelhouder omzet kapitaal inflatie rente subsidie '
                                       'vakbond staking cao werkdruk productiviteit '
                                       'onderhandeling onderhandelen leidinggevende personeel '
                                       'ontslaan:verb aanstellen benoemen investeren exporteren '
                                       'importeren financieel economisch commercieel winstgevend'),
    ('politics, law and society', 'democratie dictatuur grondwet parlement kamerlid coalitie '
                                  'oppositie wetgeving beleid maatregel hervorming referendum '
                                  'kiezer campagne debat corruptie schandaal integratie '
                                  'immigratie immigrant vluchteling asiel discriminatie '
                                  'racisme gelijkwaardig tolerantie emancipatie privacy '
                                  'rechtszaak advocaat:noun verdachte veroordeling vonnis '
                                  'gevangenisstraf getuigenis bewijs veroordelen vervolgen '
                                  'handhaven afschaffen invoeren goedkeuren protesteren '
                                  'demonstreren politiek:adj sociaal maatschappelijk'),
    ('science, technology and research', 'wetenschap onderzoeker experiment hypothese theorie '
                                         'methode analyse gegevens statistiek steekproef '
                                         'uitvinding ontdekking innovatie technologie software '
                                         'algoritme kunstmatig digitaal automatisch apparatuur '
                                         'laboratorium microscoop molecuul atoom cel:noun '
                                         'evolutie genetisch analyseren meten berekenen '
                                         'onderzoeken:verb uitvinden toepassen wetenschappelijk '
                                         'betrouwbaar nauwkeurig'),
    ('environment and climate', 'duurzaamheid duurzaam broeikaseffect uitstoot opwarming '
                                'klimaatverandering zeespiegel fossiel brandstof kernenergie '
                                'windmolen ecosysteem soort:noun biodiversiteit uitsterven '
                                'ontbossing natuurgebied grondstof hergebruik verspilling '
                                'milieuvriendelijk schadelijk uitputten'),
    ('health and medicine', 'diagnose symptoom aandoening infectie ontsteking chronisch '
                            'besmettelijk vaccin vaccinatie immuunsysteem therapie psycholoog '
                            'verslaving bijwerking voorschrift preventie levensverwachting '
                            'handicap gehandicapt ingreep revalidatie zorg:noun mantelzorg '
                            'voorschrijven onderzoeken herstellen:verb verergeren verzachten'),
    ('education and learning', 'studierichting studiepunt colleges college hoorcollege '
                               'werkgroep tentamen promotie proefschrift beoordeling '
                               'motivatie concentratie talent prestatie leerproces '
                               'zelfstandig theoretisch praktisch academisch afstuderen '
                               'beoordelen evalueren'),
    ('media, culture and the arts', 'pers persbericht redactie redacteur nieuwsgierigheid '
                                    'publicatie uitgever recensie criticus documentaire '
                                    'reportage aflevering serie publiek:noun kijker lezer '
                                    'luisteraar sociale_media influencer censuur propaganda '
                                    'literatuur poëzie beeldhouwer architectuur erfgoed '
                                    'voorstelling uitzending uitzenden publiceren recenseren'),
    ('thinking, arguing and abstract ideas', 'standpunt visie opvatting overtuiging principe '
                                             'waarde norm ethiek moraal dilemma tegenstelling '
                                             'samenhang verband:noun aspect factor kenmerk '
                                             'criterium uitgangspunt aanname bewering stelling '
                                             'nuance uitzondering voorwaarde gevolg:noun '
                                             'consequentie invloed:noun perspectief '
                                             'beschouwen benadrukken nuanceren concluderen '
                                             'veronderstellen weerleggen rechtvaardigen '
                                             'onderbouwen afwegen relativeren generaliseren '
                                             'objectief subjectief relevant overtuigend '
                                             'aannemelijk tegenstrijdig vanzelfsprekend '
                                             'controversieel'),
    ('connectives and attitude words', 'desondanks daarentegen nochtans immers derhalve '
                                       'zodoende kortom aldus althans overigens weliswaar '
                                       'enigszins uiteraard grotendeels voornamelijk '
                                       'uitsluitend nauwelijks hoogstwaarschijnlijk '
                                       'vermoedelijk:adv blijkbaar kennelijk ogenschijnlijk '
                                       'tenzij mits zolang:conj zodra naarmate doordat '
                                       'opdat alsof ongeacht betreffende inzake omtrent '
                                       'jegens middels gedurende'),
    ('character and behaviour', 'persoonlijkheid temperament karaktertrek ambitie '
                                'zelfvertrouwen verantwoordelijkheidsgevoel eerlijkheid '
                                'betrouwbaarheid ambitieus arrogant bescheiden egoïstisch '
                                'koppig flexibel creatief gemotiveerd zorgzaam tactvol '
                                'impulsief kritisch optimistisch pessimistisch sceptisch '
                                'spontaan gierig vrijgevig hypocriet'),
    ('feelings and states of mind', 'frustratie spijt wrok heimwee ontroering voldoening '
                                    'bewondering minachting walging onrust spanning:noun '
                                    'ontroerd geïrriteerd gefrustreerd overweldigd '
                                    'gedemotiveerd terneergeslagen opgetogen wanhopig '
                                    'radeloos bewonderen verafschuwen betreuren'),
    ('the city and planning', 'infrastructuur openbaar_vervoer woningnood nieuwbouw '
                              'stadsdeel gemeenteraad wethouder vergunning bestemmingsplan '
                              'renovatie bouwproject voorziening voetgangerszone '
                              'bereikbaarheid renoveren slopen'),
    ('process verbs', 'aanpakken aantonen bevorderen belemmeren bijstellen doorvoeren '
                      'functioneren handhaven:verb implementeren initiëren ondernemen '
                      'omzetten realiseren reduceren signaleren stimuleren '
                      'tegengaan uitbreiden uitvoeren verwezenlijken vaststellen '
                      'verduidelijken voortzetten waarborgen afleiden aanvullen '
                      'benutten inzetten opstellen overwegen voorspellen'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2}
