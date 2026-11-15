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

# A2 (2026-11-15): the CEFR A2 descriptor's "areas of most immediate relevance" -- the
# Swedish A2 topic list in Bokmål.  Words A1 teaches are skipped by `select.py`.
A2 = [
    ('seasons and dates', 'årstid vår:noun sommer høst vinter helg ferie jul påske bursdag '
                          'kalender dato sekund kvarter'),
    ('more numbers', 'fjorten femten seksten sytten atten nitten førti seksti sytti åtti nitti '
                     'million fjerde femte dobbel'),
    ('the land and nature', 'natur skog fjell innsjø elv strand øy jorde tre:noun blomst gress '
                            'stein himmel stjerne måne jord landsbygd park fjord'),
    ('weather', 'sky:noun skyet blåse storm grad temperatur kulde varme tåke torden våt tørr'),
    ('animals', 'dyr hund katt hest ku gris sau høne fugl mus kanin bjørn ulv elg'),
    ('clothes', 'klær genser bukse skjørt kjole skjorte jakke frakk lue sko sokk hatt veske '
                'hanske brille størrelse kle'),
    ('the home and the kitchen', 'hage vegg gulv tak trapp sofa lampe skap hylle teppe komfyr '
                                 'kjøleskap ovn tallerken kopp glass kniv gaffel kjele oppvask '
                                 'vaske rydde leie nabo'),
    ('food and cooking', 'grønnsak gulrot løk kylling pølse skinke agurk banan jordbær suppe kake '
                         'juice godteri saus pepper olje mel smørbrød koke steke bake smake søt '
                         'sur'),
    ('work and jobs', 'sjef kollega firma bedrift lønn yrke sykepleier bonde kokk selger ingeniør '
                      'tjeneste ansette arbeidsløs søke'),
    ('school and learning', 'klasse lekse kurs universitet svar ord setning øvelse '
                            'karakter papir datamaskin studere'),
    ('travel and transport', 'reise:noun båt trikk holdeplass pass koffert kart turist utland '
                             'ankomst avgang forsinkelse lande bytte'),
    ('the town', 'sentrum torg kirke museum bibliotek kino teater post politistasjon '
                 'bensinstasjon parkering hjørne bro kryss nabolag forstad'),
    ('health', 'kropp hjerte rygg hals finger kne blod tannlege resept forkjølelse hoste smerte '
               'skadet hvile'),
    ('feelings', 'følelse sint bekymring nervøs lykkelig overraske redd frykt kjærlighet '
                 'le:verb gråte bekymre savne hate'),
    ('free time', 'fritid sport fotball kamp musikk sang film bilde kunst spill svømme danse '
                  'synge male trene fiske tur'),
    ('everyday verbs', 'bære stille snu tape velge bestemme minnes låne endre sammenligne forklare '
                       'beskrive bestille stige'),
    ('describing things and people', 'høy lav bred smal tykk tynn tung myk hard rask langsom ren '
                                     'skitten vakker pen stygg slem morsom kjedelig interessant '
                                     'vanlig rar enkel mørk lys:adj full tom åpen stenge '
                                     'hyggelig'),
    ('time words', 'sjelden straks fortsatt senere tidligere nettopp mens ennå daglig'),
    ('connectors', 'derfor selv_om likevel altså dessuten enten verken unntatt'),
]

# B1 (2026-11-15): the CEFR B1 descriptor's "familiar matters regularly encountered in work,
# school, leisure" -- the Swedish B1 topic list in Bokmål.  Words lower levels teach are skipped.
B1 = [
    ('work and the economy', 'økonomi arbeidsgiver arbeidstaker lærling praksis utdanning '
                             'erfaring søknad intervju kontrakt kostnad utgift inntekt pensjon '
                             'fagforening streik gevinst tap marked kunde heltid deltid '
                             'overtid oppsigelse forfremme'),
    ('society and politics', 'samfunn politikk politiker parti kommune borger innvandrer '
                             'flyktning demokrati rettighet plikt myndighet domstol forbrytelse '
                             'straff anmeldelse stemme:verb demonstrasjon'),
    ('media and technology', 'nyhet artikkel program kanal internett nettside e-post passord '
                             'skjerm tastatur laste lagre slette:verb annonse reklame'),
    ('the environment', 'miljø klima forurensning avfall gjenvinning energi strøm bensin utslipp '
                        'beskytte jordbruk landskap flom tørke:noun'),
    ('education', 'videregående høyskole fag eksamen oppgave forelesning lærebok rektor semester '
                  'kunnskap'),
    ('relationships and family life', 'forhold ekteskap skilsmisse samboer kjæreste vennskap '
                                      'slekt slektning fetter kusine tante onkel svigermor '
                                      'barnebarn tenåring oppvekst bryllup'),
    ('home and housing', 'bolig leieboer utleier enebolig rekkehus pusse_opp møbel oppvarming '
                         'vaskemaskin oppvaskmaskin støvsuger balkong kjeller loft'),
    ('health and the body', 'helse sykdom skade:noun behandling operasjon vaksine allergi stresse '
                            'søvn mosjon kosthold vekt lunge skjelett muskel hud blodtrykk akutt '
                            'ambulanse undersøkelse'),
    ('travel and experiences', 'reisebyrå bestilling utflukt severdighet opplevelse eventyr utsikt '
                               'overnatting vandrerhjem telt toll valuta kyst foss'),
    ('culture and leisure', 'kultur konsert utstilling roman forfatter dikt maleri kunstner '
                            'forestilling publikum scene tradisjon sankthans høytid hobby '
                            'interesse'),
    ('feelings and opinions', 'oppfatning håp:noun uro skuffelse sorg skam misunnelse stolthet '
                              'tillit tvil foretrekke påstand'),
    ('thinking and talking', 'forklaring eksempel løsning forslag diskusjon argument fordel ulempe '
                             'årsak følge:noun resultat hensikt sammenligning likhet beskrivelse'),
    ('verbs of B1', 'påvirke utvikle forbedre minske øke erstatte gjenta kritisere klage oppmuntre '
                    'støtte:verb organisere delta:verb gjennomføre beslutte anbefale tillate forby '
                    'lykkes mislykkes oppleve'),
    ('describing and judging', 'urettferdig rettferdig selvstendig ansvarlig pålitelig '
                               'nysgjerrig sta sjenert modig lat flittig positiv negativ '
                               'tilstrekkelig passe:adj behagelig ubehagelig offentlig moderne '
                               'tradisjonell økonomisk politisk sosial'),
    ('time and frequency', 'hittil samtidig etter_hvert til_slutt stadig hverdag '
                           'århundre tiår'),
    ('connectors and argument', 'derimot ettersom med_mindre nemlig '
                                'for_eksempel i_hvert_fall uansett'),
]

# B2 (2026-11-15): the CEFR B2 descriptor's "complex text on both concrete and abstract topics"
# -- the Swedish B2 topic list in Bokmål.  Words lower levels teach are skipped.
B2 = [
    ('the economy and work', 'inflasjon rente lån investering aksje budsjett vekst:noun '
                             'arbeidsledighet næringsliv konkurranse eksport import gründer '
                             'entreprenør styre forhandling lønnsom'),
    ('politics and the state', 'opposisjon minister stortingsrepresentant lovgivning reform '
                               'vedtak valgkamp flertall mindretall ideologi propaganda korrupsjon '
                               'ytringsfrihet integrering diskriminering likestilling velferd bistand'),
    ('law and justice', 'tiltale rettssak bot kriminalitet'),
    ('science and technology', 'forskning forsker hypotese analyse oppdagelse oppfinnelse utvikling '
                               'digital programvare algoritme data kunstig intelligens'),
    ('the environment and resources', 'klimaendring drivhus karbondioksid fossil fornybar '
                                      'bærekraftig bærekraft ressurs naturressurs utryddelse '
                                      'mangfold økosystem kjernekraft vindkraft solenergi'),
    ('health and society', 'omsorg helsevesen psykisk depresjon angst avhengighet '
                           'misbruk rehabilitering livsstil forebygge'),
    ('media and communication', 'sensur debatt kommunikasjon budskap tolkning '
                                'publisere kommentere granske'),
    ('culture and society', 'verdi:noun norm fordom religion sekulær globalisering '
                            'migrasjon befolkning likhet'),
    ('abstract nouns', 'aspekt faktor vilkår forutsetning konsekvens betydning sammenheng '
                       'perspektiv tendens hindring begrensning innflytelse strategi prioritet '
                       'kvalitet kvantitet prosess struktur funksjon'),
    ('arguing and reasoning', 'understreke begrunne forutsette konstatere '
                              'bedømme vurdere evaluere analysere tolke oppsummere argumentere '
                              'motsi innrømme tydeliggjøre belyse'),
    ('verbs of B2', 'oppnå anvende etablere opprettholde bidra motvirke begrense tilpasse omfatte '
                    'medføre fremheve avstå lette:verb vanskeliggjøre forsterke svekke'),
    ('describing and evaluating', 'omfattende betydelig avgjørende vesentlig grunnleggende kompleks '
                                  'komplisert tvetydig entydig effektiv kontroversiell '
                                  'subjektiv urimelig relevant aktuell eksisterende åpenbar '
                                  'sannsynlig usannsynlig'),
    ('connectors and discourse', 'imidlertid således følgelig dog uavhengig vedrørende særlig '
                                 'tross ifølge hvorvidt dermed'),
]

# C1 (2026-11-15): the CEFR C1 descriptor's "demanding, longer texts" -- the Swedish C1 topic
# list in Bokmål.  Words lower levels teach are skipped.
C1 = [
    ('academic and intellectual', 'avhandling empirisk teoretisk begrep definisjon slutning '
                                  'kriterium fenomen mekanisme variabel korrelasjon utvalg '
                                  'metodikk abstrakt:adj konkret prinsipiell'),
    ('society and governance', 'forvaltning offentlighet statsborgerskap folkeavstemning grunnlov '
                               'maktfordeling sanksjon tilsyn myndighet fullmakt'),
    ('economy and business', 'omsetning kapital gjeld:noun lavkonjunktur anbud avkastning'),
    ('law and ethics', 'etikk moralsk overtredelse presedens formål'),
    ('mind and behaviour', 'bevissthet drivkraft motivasjon selvfølelse selvtillit fornektelse'),
    ('language and rhetoric', 'retorikk nyanse ironi metafor formulering fremstilling standpunkt'),
    ('abstract nouns', 'tilnærming omstendighet forløp helhet bestanddel særtrekk motsetning'),
    ('verbs of C1', 'presisere kartlegge påvise belegge forutsi bestride utbedre tilskrive fravike '
                    'tilsidesette'),
    ('adjectives of C1', 'påtagelig inngående motstridende velbegrunnet uholdbar betraktelig '
                         'marginal ubetydelig uforutsigbar tvilsom'),
    ('formal connectors', 'dessuten derved således ikke_desto_mindre riktignok hvorvidt uaktet'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
