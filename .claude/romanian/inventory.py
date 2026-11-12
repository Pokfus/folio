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

B1 = [
    ('work and career', 'carieră profesie post loc_de_muncă angajator angaja concedia demisie '
                        'demisiona interviu experiență calificare abilitate competență '
                        'responsabilitate sarcină proiect ședință termen contract salariat '
                        'coleg_de_serviciu birocrație afacere companie întreprindere industrie '
                        'producție profit pierdere buget investiție economie comerț marfă '
                        'ofertă cerere concurență succes eșec promovare pensie șomaj șomer '
                        'program_de_lucru tură negocia organiza conduce coordona'),
    ('education and learning', 'educație învățământ elev materie disciplină matematică istorie '
                               'geografie fizică chimie biologie literatură gramatică vocabular '
                               'pronunție exercițiu test rezultat medie bursă licență master '
                               'doctorat cercetare studiu teză profesoară învățător absolvent '
                               'absolvi studia memora exersa repeta preda promova pica'),
    ('media and technology', 'presă ziar revistă articol știre jurnalist reporter emisiune canal '
                             'post_de_radio reclamă publicitate internet site pagină rețea '
                             'aplicație program parolă cont mesaj e-mail fișier document '
                             'imprimantă ecran tastatură baterie încărcător conexiune '
                             'tehnologie digital virtual online descărca încărca salva șterge '
                             'tipări posta distribui instala'),
    ('the environment', 'mediu_înconjurător poluare deșeu gunoi reciclare climă încălzire '
                        'energie electricitate combustibil petrol cărbune gaz resursă protecție '
                        'specie faună floră inundație secetă cutremur incendiu dezastru '
                        'catastrofă ocean continent planetă atmosferă aer poluat curat recicla '
                        'proteja polua economisi risipi'),
    ('society and public life', 'societate comunitate populație cetățenie guvern stat parlament '
                                'ministru președinte primar partid politică politician alegere '
                                'vot candidat campanie lege drept:noun libertate democrație '
                                'putere opoziție protest grevă manifestație criză sărăcie '
                                'bogăție impozit taxă sistem serviciu_public '
                                'administrație autoritate instituție organizație vota alege '
                                'protesta'),
    ('law and crime', 'crimă infracțiune hoț furt jaf criminal victimă martor suspect '
                      'acuzat avocată judecător tribunal proces dovadă anchetă închisoare '
                      'pedeapsă amendă arest fura jefui ataca aresta acuza judeca condamna '
                      'pedepsi minți'),
    ('health and lifestyle', 'stil_de_viață dietă nutriție vitamină greutate exercițiu antrenament '
                             'sală_de_sport stres somn obicei fumat alcool drog dependență '
                             'tratament operație spitalizare simptom diagnostic infecție virus '
                             'vaccin injecție asigurare medic_de_familie clinică cabinet '
                             'însănătoși slăbi îngrășa fuma antrena trata opera'),
    ('relationships and feelings', 'relație căsătorie divorț despărțire încredere respect '
                                   'prietenie iubire dor gelozie rușine vină regret '
                                   'satisfacție mulțumire dezamăgire entuziasm emoție sentiment '
                                   'stare dispoziție singurătate căsători divorța despărți '
                                   'certa împăca iubi urî respecta încrede îndrăgosti '
                                   'dezamăgi impresiona emoționa singur fidel loial '
                                   'dezamăgit entuziasmat emoționat recunoscător'),
    ('character and behaviour', 'personalitate caracter comportament atitudine calitate defect '
                                'onest cinstit corect responsabil serios ambițios încăpățânat '
                                'egoist arogant modest prietenos sociabil optimist pesimist '
                                'creativ inteligent prost atent neatent grijuliu matur '
                                'comporta purta'),
    ('opinions and argument', 'opinie părere idee punct_de_vedere argument motiv cauză efect '
                              'consecință avantaj dezavantaj problemă soluție întrebare '
                              'propunere sugestie acord dezacord discuție dezbatere '
                              'concluzie exemplu fapt adevăr minciună zvon '
                              'considera crede presupune sugera propune susține recomanda '
                              'convinge accepta refuza nega admite recunoaște compara '
                              'discuta argumenta dovedi demonstra critica lăuda'),
    ('linking words', 'totuși însă deși ci așadar prin_urmare de_aceea astfel adică de_exemplu '
                      'în_plus de_asemenea mai_ales cel_puțin în_schimb pe_de_altă_parte '
                      'în_primul_rând în_general în_special în_orice_caz oricum fie '
                      'nici atât decât ca încât ca_să deoarece întrucât până_când '
                      'în_timp_ce după_ce înainte_să imediat_ce probabil posibil sigur '
                      'desigur bineînțeles evident aproximativ aproape complet total '
                      'parțial destul prea cam'),
    ('travel and its problems', 'destinație itinerar călător pasager zbor_direct escală '
                                'îmbarcare bagaj_de_mână cameră_dublă recepție cazare '
                                'pensiune cort camping traseu ghid_turistic suvenir '
                                'monument castel cetate ruină asigurare_de_călătorie '
                                'anulare reclamație despăgubire accident defect '
                                'rătăci anula amâna confirma reclama'),
    ('services and shopping', 'serviciu_clienți reducere ofertă_specială chitanță factură '
                              'garanție schimb rambursare livrare comandă coș plată numerar '
                              'rată credit datorie economii cont_bancar dobândă bancomat '
                              'transfer abonament contor livra returna împrumuta datora '
                              'economisi cheltui investi'),
    ('housing', 'locuință proprietar chiriaș contract_de_închiriere bloc vilă cartier_rezidențial '
                'vecinătate mutare renovare reparație instalator electrician încălzire_centrală '
                'calorifer aer_condiționat gaz_natural factură_la_curent mobilat utilat spațios '
                'luminos închiria renova zugrăvi amenaja'),
    ('culture and the arts', 'cultură artă artist operă pictură tablou sculptură scriitor poet '
                             'poezie roman povestire autor personaj scenă actor actriță regizor '
                             'premieră galerie festival tradiție obicei religie credință '
                             'istorie_națională patrimoniu stil gen public aplauze critic '
                             'interpreta regiza compune publica'),
    ('abstract ideas', 'viață moarte lume realitate vis dorință scop plan șansă ocazie risc '
                       'pericol siguranță securitate schimbare dezvoltare progres viitor '
                       'trecut experiență amintire memorie imaginație cunoaștere inteligență '
                       'înțelegere atenție interes valoare importanță calitate cantitate '
                       'diferență asemănare legătură rol parte întreg nivel grad măsură '
                       'mod metodă proces pas etapă fază situație condiție'),
    ('thinking and communicating', 'imagina realiza observa remarca descoperi analiza '
                                   'evalua estima calcula prevedea anticipa ezita '
                                   'îndoi bănui recunoaște exprima descrie povesti '
                                   'relata anunța informa avertiza sfătui convinge '
                                   'insista cere implora reproșa scuza ierta plânge '
                                   'zâmbi râde striga șopti'),
    ('everyday verbs', 'atinge apuca trage împinge ridica lăsa pune așeza aduna strânge '
                       'umple goli adăuga scădea crește spori reduce mări micșora '
                       'înlocui transforma adapta îmbunătăți dezvolta produce crea '
                       'distruge proteja păzi salva fugi scăpa evita risca încerca '
                       'reuși eșua obține pierde câștiga merita depinde aparține '
                       'conține include exclude lipsi exista apărea dispărea '
                       'rămâne continua întrerupe opri suporta tolera'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1}
