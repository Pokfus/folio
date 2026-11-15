#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Danish word list was found published (see `danish_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`en:article`) where the
spelling is shared and the level wants one reading first.  An underscore joins
a two-word entry (`i_dag`).  Spellings are Wiktionary's headwords: a verb by
its infinitive (`spise`), a noun in the indefinite singular (a plural-only noun
in the plural: `penge`), an adjective in its common-gender form.  Where
Wiktionary heads a word under a form a learner does not meet first, the
learner's word is written and `select.ALIAS` names the headword (`mange`,
filed under `mangen`).

A1 to B2 are written (2026-11-15); C1 is the plan's later phase.
"""

A1 = [
    ('pronouns', 'jeg du han:pron hun:pron den:pron det:pron vi I de:pron man:pron mig dig ham:pron hende os jer dem sig '
                 'min:pron din vores jeres deres sin:pron'),
    ('articles', 'en:article'),
    ('questions', 'hvad hvem hvor hvornår hvorfor hvordan hvilken'),
    ('prepositions and place words', 'i på til:prep fra med uden for:prep af:prep om:prep under over efter før hos '
                                     'ved:prep mellem foran bag:prep hjem hjemme her der ude inde op ned ud ind '
                                     'væk nær'),
    ('conjunctions and little words', 'og eller men:conj at som:pron fordi så ikke ja nej jo også bare '
                                      'meget lidt måske altid aldrig tit ofte igen nu:adv snart '
                                      'allerede'),
    ('greetings and politeness', 'hej farvel tak undskyld godmorgen godnat goddag velkommen værsgo'),
    ('numbers', 'nul to tre fire fem seks syv otte ni ti elleve tolv tyve tredive fyrre hundrede '
                'tusind første anden tredje halv'),
    ('time', 'tid time minut dag nat morgen aften eftermiddag i_dag i_morgen i_går uge måned år '
             'ur klokke tidlig sen:adj'),
    ('days', 'mandag tirsdag onsdag torsdag fredag lørdag søndag'),
    ('months', 'januar februar marts april maj juni juli august september oktober november '
               'december'),
    ('family', 'familie mor far bror søster søn datter kvinde kone mand barn dreng pige mormor '
               'farmor morfar farfar ven veninde baby forældre'),
    ('people and yourself', 'navn alder land by sprog dansk engelsk arbejde:noun job elev '
                            'studerende lærer læge menneske person'),
    ('food and drink', 'mad vand kaffe te mælk brød vin øl ost kød fisk æg frugt æble appelsin '
                       'tomat sukker salt:noun morgenmad frokost aftensmad kartoffel ris smør is'),
    ('shopping and money', 'penge krone pris butik forretning købe sælge betale koste billig dyr:adj'),
    ('the home', 'hus lejlighed værelse dør vindue bord stol seng køkken badeværelse toilet bog '
                 'kuglepen telefon nøgle'),
    ('the town and getting about', 'gade vej bil bus tog taxa billet station hotel hospital '
                                   'skole kontor bank højre venstre lufthavn hav '
                                   'restaurant apotek cykel'),
    ('the body and feeling ill', 'hoved øje øre næse mund hånd arm ben fod mave tand syg rask '
                                 'medicin feber'),
    ('weather', 'vejr varm kold regn sol vind:noun sne regne'),
    ('colours', 'farve rød blå gul grøn sort hvid brun'),
    ('describing', 'stor lille ny gammel ung fin god dårlig glad ked lang kort let svær:adj mange '
                   'alle hver ingenting træt sulten'),
    ('everyday verbs', 'være have:verb gøre gå komme spise:verb drikke sove vågne sidde se høre snakke '
                       'tale:verb sige læse skrive forstå vide kunne ville skulle måtte:verb få:verb bo:verb '
                       'hedde synes åbne lukke spørge svare tænke elske arbejde:verb lære kigge '
                       'lytte tage give køre rejse:verb hjælpe:verb finde'),
]

A2 = [
    ('seasons and dates', 'årstid forår sommer efterår vinter weekend ferie jul påske fødselsdag kalender '
                          'dato sekund kvarter'),
    ('more numbers', 'tretten fjorten femten seksten sytten atten nitten halvtreds tres halvfjerds firs '
                     'halvfems million fjerde femte dobbelt'),
    ('the land and nature', 'natur skov bjerg sø flod å strand ø mark træ blomst græs sten himmel stjerne '
                            'måne jord land:noun park bakke'),
    ('weather', 'sky:noun skyet blæse storm grad temperatur kulde varme tåge torden våd tør'),
    ('animals', 'dyr hund kat hest ko gris får:noun høne fugl mus kanin bjørn ulv'),
    ('clothes', 'tøj trøje bukser nederdel kjole skjorte jakke frakke hue sko strømpe hat taske handske '
                'brille størrelse'),
    ('the home and the kitchen', 'have:noun væg gulv trappe sofa lampe skab hylde tæppe komfur køleskab '
                                 'ovn tallerken kop glas kniv gaffel ske gryde vaske gøre_rent husleje leje:verb '
                                 'nabo'),
    ('food and cooking', 'grøntsag gulerod løg kylling pølse skinke agurk banan jordbær suppe kage juice slik '
                         'sovs peber olie mel sandwich koge stege bage smage sød sur:adj'),
    ('work and jobs', 'chef kollega firma løn møde fag sygeplejerske politibetjent landmand kok sælger '
                      'ingeniør ansætte arbejdsløs ansøge'),
    ('school and learning', 'klasse lektion lektie eksamen kursus universitet spørgsmål svar ord sætning '
                            'øvelse karakter papir computer studere'),
    ('travel and transport', 'rejse:noun fly båd sporvogn busstoppested pas kuffert kort:noun turist '
                             'udland ankomst afgang forsinkelse lande:verb stige skifte'),
    ('the town', 'centrum torv kirke museum bibliotek biograf teater posthus politistation tankstation '
                 'parkering hjørne bro kryds kvarter'),
    ('health', 'krop hjerte ryg hals finger knæ blod tandlæge recept forkølet hoste smerte skade:verb '
               'hvile'),
    ('feelings', 'følelse vred bekymret nervøs lykkelig skuffet overraske frygt kærlighed grine græde '
                 'savne hade'),
    ('free time', 'fritid sport fodbold kamp musik sang film billede kunst spil svømme danse synge male '
                  'træne fiske tur'),
    ('everyday verbs', 'bære vise:verb lægge stille:verb vende vinde:verb tabe begynde slutte vælge beslutte '
                       'glemme huske love låne sende ændre sammenligne forklare beskrive bestille vente '
                       'invitere besøge'),
    ('describing things and people', 'høj lav bred smal tyk tynd tung blød hård hurtig langsom ren:adj '
                                     'beskidt stille:adj højlydt smuk grim sød:adj flink sjov kedelig '
                                     'interessant vigtig almindelig mærkelig nem mørk lys:adj fuld tom '
                                     'åben lukket'),
    ('time words', 'sjældent straks stadig senere nylig mens endnu dagligt'),
    ('connectors', 'derfor selvom hvis inden når også desuden alligevel enten hverken undtagen'),
]

B1 = [
    ('work and the economy', 'økonomi arbejdsgiver arbejdstager ansat lærling praktik uddannelse erfaring '
                             'ansøgning interview kontrakt skat udgift indkomst indtægt pension fagforening '
                             'strejke overskud underskud marked fuldtid deltid overarbejde fyring '
                             'forfremmelse'),
    ('society and politics', 'samfund politik politiker parti folketing kommune borger indvandrer flygtning '
                             'demokrati rettighed pligt myndighed domstol forbrydelse straf anmeldelse stemme:verb '
                             'demonstration valg'),
    ('media and technology', 'avis nyhed artikel program kanal internet hjemmeside mail adgangskode app '
                             'skærm tastatur downloade printe gemme:verb slette:verb annonce reklame'),
    ('the environment', 'miljø klima forurening affald genbrug energi strøm benzin udledning beskytte '
                        'landbrug landskab oversvømmelse tørke'),
    ('education', 'gymnasium fag:noun eksamen opgave forelæsning lærebog rektor semester viden '
                  'skoleelev'),
    ('relationships and family life', 'forhold ægteskab skilsmisse samlever kæreste venskab familie slægt '
                                      'slægtning fætter kusine moster faster morbror farbror svigermor '
                                      'barnebarn teenager opvækst bryllup begravelse mødes omgås'),
    ('home and housing', 'bolig lejer udlejer villa rækkehus flytte renovere møbel opvarmning nabolag '
                         'vaskemaskine opvaskemaskine støvsuger altan kælder:noun loft'),
    ('health and the body', 'sundhed sygdom skade:noun behandling operation vaccine allergi stress søvn '
                            'motion kost vægt lunge skelet muskel hud blodtryk akut ambulance '
                            'undersøgelse'),
    ('travel and experiences', 'rejsebureau booking udflugt seværdighed oplevelse eventyr udsigt '
                               'vandrerhjem telt grænse told valuta kyst vandfald'),
    ('culture and leisure', 'kultur koncert udstilling roman forfatter digt maleri kunstner forestilling '
                            'publikum scene tradition fest hobby interesse'),
    ('feelings and opinions', 'holdning mening tro:noun håb uro skuffelse glæde sorg skam misundelse '
                              'stolthed tillid tvivl foretrække mene påstå tvivle overbevise'),
    ('thinking and talking', 'forklaring eksempel problem løsning forslag diskussion argument fordel '
                             'ulempe årsag følge:noun resultat formål sammenligning forskel lighed '
                             'beskrivelse'),
    ('verbs of B1', 'påvirke udvikle forbedre mindske øge erstatte undgå gentage kritisere klage opmuntre '
                    'støtte organisere deltage gennemføre foreslå anbefale tilbyde kræve tillade forbyde '
                    'lykkes mislykkes opleve overraske imponere'),
    ('describing and judging', 'tilfreds utilfreds uretfærdig retfærdig selvstændig ansvarlig pålidelig '
                               'nysgerrig stædig genert modig doven flittig ærlig alvorlig positiv negativ '
                               'nødvendig mulig umulig tilstrækkelig behagelig ubehagelig offentlig privat '
                               'moderne traditionel økonomisk politisk social'),
    ('time and frequency', 'nutildags hidtil samtidig efterhånden endelig konstant pludselig '
                           'hverdag århundrede årti'),
    ('connectors and argument', 'derimod desuden fordi eftersom medmindre mens skønt nemlig '
                                'for_eksempel til_sidst i_hvert_fald alligevel dels'),
]

B2 = [
    ('the economy and work', 'konjunktur inflation rente lån investering aktie budget vækst arbejdsløshed '
                             'erhvervsliv branche konkurrence eksport import handel iværksætter ledelse '
                             'bestyrelse ansættelse arbejdsmarked forhandling rentabel'),
    ('politics and the state', 'regering opposition minister statsminister lovgivning reform '
                               'bekendtgørelse beslutning valgkamp flertal mindretal ideologi propaganda '
                               'korruption ytringsfrihed integration diskrimination ligestilling velfærd '
                               'bistand'),
    ('law and justice', 'retssystem advokat dom anklage:noun retssag vidneudsagn bevis skyldig uskyldig '
                        'fængselsstraf bøde kriminalitet efterforskning'),
    ('science and technology', 'videnskab forskning forsker teori hypotese metode analyse undersøgelse '
                               'opdagelse opfindelse teknologi udvikling digital software algoritme data '
                               'kunstig intelligens'),
    ('the environment and resources', 'klimaforandring drivhuseffekt kuldioxid fossil vedvarende '
                                      'bæredygtig bæredygtighed ressource naturressource udryddelse '
                                      'mangfoldighed økosystem atomkraft vindkraft solenergi'),
    ('health and society', 'folkesundhed forældremyndighed sundhedsvæsen psykisk depression angst '
                           'afhængighed misbrug genoptræning livsstil forebygge'),
    ('media and communication', 'journalistik kilde censur debat kommunikation budskab fortolkning '
                                'offentliggøre kommentere undersøge'),
    ('culture and society', 'identitet generation værdi norm fordom religion sekulær globalisering '
                            'migration befolkning klasse lighed'),
    ('abstract nouns', 'aspekt faktor vilkår forudsætning konsekvens betydning sammenhæng perspektiv '
                       'tendens udfordring hindring mulighed begrænsning påvirkning indflydelse ansvar '
                       'hensigt strategi prioritet kvalitet kvantitet proces struktur funktion'),
    ('arguing and reasoning', 'hævde understrege betone sætte_spørgsmålstegn begrunde antage '
                              'forudsætte konstatere bedømme evaluere analysere fortolke sammenfatte '
                              'argumentere modsige indvende indrømme tydeliggøre belyse'),
    ('verbs of B2', 'opnå gennemføre anvende etablere opretholde bidrage fremme modvirke forhindre '
                    'begrænse tilpasse omfatte medføre fremhæve fortaler afstå lette:verb vanskeliggøre '
                    'forårsage udnytte forstærke svække'),
    ('describing and evaluating', 'omfattende betydelig afgørende væsentlig grundlæggende kompleks '
                                  'indviklet tvetydig entydig effektiv kontroversiel objektiv subjektiv '
                                  'rimelig urimelig troværdig relevant aktuel eksisterende primært '
                                  'åbenlys sandsynlig usandsynlig'),
    ('connectors and discourse', 'imidlertid således følgelig dog uanset angående vedrørende især '
                                 'trods trods_alt ifølge hvorvidt derved'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2}
