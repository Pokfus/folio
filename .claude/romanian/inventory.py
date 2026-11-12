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

B2 = [
    ('work and the economy', 'piață_muncii forță_de_muncă productivitate eficiență '
                             'performanță strategie obiectiv prioritate gestiona administra '
                             'conducător manager acționar parteneriat fuziune faliment datorie_publică '
                             'inflație recesiune creștere_economică export import tarif subvenție '
                             'finanțare împrumut ipotecă capital venit cheltuială beneficiu '
                             'consumator producător furnizor client_fidel contabil contabilitate '
                             'audit salariu_minim sindicat negociere colaborare colabora delega '
                             'externaliza angajament remunerație stagiu stagiar freelancer'),
    ('science and research', 'știință științific cercetător experiment ipoteză teorie '
                             'dovadă descoperire invenție inovație analiză date statistică '
                             'metodologie eșantion laborator microscop moleculă atom genă '
                             'celulă organism evoluție specie ecosistem biodiversitate '
                             'fenomen proprietate structură funcționare mecanism verifica '
                             'testa măsura observa deduce formula'),
    ('technology and the internet', 'inteligență_artificială algoritm robot automatizare '
                                    'software hardware bază_de_date server rețea_socială '
                                    'utilizator profil confidențialitate securitate_cibernetică '
                                    'hacker virus_informatic actualizare versiune navigator '
                                    'motor_de_căutare platformă conținut abonat urmăritor '
                                    'dispozitiv_mobil inovator digitaliza actualiza accesa '
                                    'programa'),
    ('politics and government', 'stat_de_drept constituție legislație reformă guvernare '
                                'coaliție majoritate minoritate mandat referendum alegeri '
                                'electorat dezbatere_publică diplomație ambasadă '
                                'ambasador tratat acord_internațional sancțiune conflict '
                                'negocieri suveranitate independență frontieră imigrație '
                                'emigrare refugiat azil integrare corupție transparență '
                                'birocrat funcționar_public senat senator deputat '
                                'legifera guverna reforma ratifica'),
    ('law and justice', 'justiție sistem_judiciar instanță sentință verdict apel recurs '
                        'inculpat reclamant apărător acuzare probă mărturie jurământ '
                        'contravenție delict fraudă înșelătorie mită corupe șantaj '
                        'răpire omucidere violență agresiune hărțuire discriminare '
                        'drepturile_omului încălcare penal civil legitim ilegitim '
                        'nevinovăție vinovăție achita elibera interzice autoriza'),
    ('environment and sustainability', 'schimbări_climatice efect_de_seră emisie carbon '
                                       'sustenabilitate energie_regenerabilă panou_solar '
                                       'turbină eolian hidrocentrală defrișare deșertificare '
                                       'eroziune contaminare toxic biodegradabil ecologic '
                                       'conservare habitat extincție dăunător '
                                       'compost amprentă_de_carbon epuiza conserva '
                                       'contamina defrișa'),
    ('health and medicine', 'sănătate_publică sistem_sanitar epidemie pandemie '
                            'imunitate anticorp bacterie microb boală_cronică diabet '
                            'tensiune inimă_bolnavă accident_vascular depresie anxietate '
                            'terapie terapeut psiholog psihiatru chirurg chirurgie '
                            'anestezie transplant donator recuperare reabilitare '
                            'prevenție profilaxie efect_secundar doză prescripție '
                            'preveni diagnostica vaccina recupera'),
    ('mind and emotions', 'conștiință subconștient percepție intuiție motivație ambiție '
                          'frustrare resentiment invidie compasiune empatie toleranță '
                          'nostalgie melancolie euforie panică teroare angoasă '
                          'stimă_de_sine încredere_în_sine vulnerabilitate rezistență '
                          'echilibru maturitate obsesie fobie trauma traumă '
                          'frustrat anxios deprimat nostalgic empatic vulnerabil '
                          'motiva frustra deprima consola liniști'),
    ('society and social issues', 'inegalitate egalitate discriminare rasism sexism '
                                  'prejudecată stereotip diversitate incluziune excludere '
                                  'marginalizare sărăcie_extremă bunăstare protecție_socială '
                                  'ajutor_social voluntariat voluntar caritate donație '
                                  'organizație_nonguvernamentală activist mișcare protest '
                                  'generație bătrânețe tinerețe urbanizare globalizare '
                                  'migrație identitate apartenență solidaritate '
                                  'dona integra marginaliza'),
    ('media and communication', 'mass-media jurnalism redacție redactor editorial titlu '
                                'interviu_exclusiv sursă_anonimă dezinformare propagandă '
                                'cenzură libertatea_presei opinie_publică audiență '
                                'transmisiune_în_direct documentar reportaj comentator '
                                'reclamă publicitar campanie_publicitară imagine reputație '
                                'scandal controversă difuza transmite cenzura manipula '
                                'influența comunica'),
    ('arguing, persuading and evaluating', 'afirmație argumentare raționament premisă '
                                           'contraargument obiecție controversă dilemă '
                                           'compromis consens perspectivă abordare criteriu '
                                           'aspect factor implicație interpretare '
                                           'justificare clarificare evaluare critică '
                                           'afirma justifica clarifica sublinia evidenția '
                                           'contesta respinge ignora exagera minimaliza '
                                           'generaliza simplifica nuanța '
                                           'convingător plauzibil relevant irelevant '
                                           'obiectiv subiectiv coerent contradictoriu '
                                           'discutabil incontestabil esențial fundamental'),
    ('linking and discourse', 'cu_toate_acestea în_ciuda totodată ulterior anterior '
                              'în_consecință dimpotrivă altfel respectiv eventual '
                              'practic teoretic aparent efectiv realmente într-adevăr '
                              'în_mod_special în_mod_evident pe_scurt în_concluzie '
                              'cu_alte_cuvinte în_ceea_ce_privește referitor privind '
                              'conform potrivit datorită din_cauza în_funcție_de '
                              'cu_condiția_să decât_dacă chiar_dacă ca_și_cum '
                              'oarecum relativ considerabil semnificativ treptat '
                              'brusc constant permanent temporar ocazional'),
    ('culture, arts and leisure', 'capodoperă expoziție_permanentă curent_artistic '
                                  'avangardă clasic contemporan modern estetic '
                                  'operă_de_artă colecție colecționar muzeograf '
                                  'arhitectură arhitect compozitor dirijor orchestră '
                                  'simfonie balet coregrafie scenariu scenarist '
                                  'interpretare recenzie critic_literar romancier '
                                  'nuvelă eseu biografie autobiografie memorii '
                                  'metaforă simbol temă narator ficțiune '
                                  'inspira ilustra adapta ecraniza'),
    ('travel, places and geography', 'peisaj relief câmpie podiș munți litoral '
                                     'deltă golf peninsulă arhipelag climat_temperat '
                                     'regiune provincie județ capitală metropolă '
                                     'periferie suburbie mediu_rural mediu_urban '
                                     'infrastructură autostradă cale_ferată transport_public '
                                     'aglomerație ambuteiaj turism_de_masă ecoturism '
                                     'cazare_turistică atracție_turistică sit '
                                     'explora descoperi aventură'),
    ('describing people and things', 'carismatic charismatic autoritar tolerant '
                                     'intolerant perseverent meticulos superficial '
                                     'sensibil insensibil impulsiv rațional spontan '
                                     'rezervat discret extravagant excentric '
                                     'conservator progresist tradițional '
                                     'complex simplu sofisticat banal remarcabil '
                                     'considerabil substanțial neglijabil minor major '
                                     'evident subtil vag precis exact riguros '
                                     'durabil fragil solid flexibil rigid'),
    ('abstract nouns', 'esență fenomen tendință evoluție declin ascensiune transformare '
                       'tranziție criză_economică stabilitate instabilitate prosperitate '
                       'echitate eficacitate viabilitate fiabilitate sustenabil '
                       'potențial capacitate limitare constrângere obstacol provocare '
                       'oportunitate inițiativă angajament implicare contribuție '
                       'influență impact repercusiune semnificație relevanță '
                       'complexitate ambiguitate certitudine incertitudine '
                       'probabilitate posibilitate necesitate obligație privilegiu'),
    ('verbs of change and action', 'accelera încetini stimula frâna consolida slăbi '
                                   'întări diminua amplifica extinde restrânge '
                                   'genera provoca declanșa determina influența '
                                   'contribui implica implementa aplica realiza '
                                   'atinge depăși surmonta înfrunta rezolva soluționa '
                                   'gestiona administra supraveghea monitoriza '
                                   'menține conserva păstra abandona renunța '
                                   'revendica pretinde solicita acorda oferi '
                                   'aproba respinge amâna prelungi suspenda '
                                   'înființa fonda desființa reorganiza restructura'),
]

C1 = [
    ('economy and finance', 'macroeconomie microeconomie fiscalitate fiscal  valutar '
                            'lichiditate solvabilitate insolvență creditor debitor dividend '
                            'obligațiune portofoliu speculă speculant randament deficit '
                            'excedent austeritate stagnare deflație devalorizare privatizare '
                            'naționalizare monopol  antreprenor antreprenoriat '
                            'cifră_de_afaceri evaziune contribuabil impozitare redistribuire '
                            'investitor subvenționa privatiza naționaliza falimenta amortiza '
                            'speculație tranzacție licitație achiziție'),
    ('politics, state and power', 'guvernanță legitimitate hegemonie populism populist '
                                  'naționalism extremism radicalism totalitarism dictatură '
                                  'dictator pluralism federalism descentralizare centralizare '
                                  'clientelism nepotism demagogie demagog ideologie ideologic '
                                  'doctrină moțiune ordonanță decret promulga abroga demite '
                                  'destitui dizolva represiune disident insurecție '
                                  'lovitură_de_stat imperialism colonialism colonizare '
                                  'geopolitică geopolitic lege_organică'),
    ('law and rights', 'jurisprudență jurisdicție legalitate prescripție uzurpare complicitate '
                       'complice premeditare circumstanță atenuant agravant despăgubi litigiu '
                       'pârât notar notarial procură moștenire moștenitor succesiune clauză '
                       'reziliere rezilia incrimina dezincrimina grațiere amnistie extrădare '
                       'extrăda magistrat magistratură procurorie avocatură'),
    ('science and knowledge', 'empiric empirism epistemologie paradigmă postulat axiomă teoremă '
                              'variabilă parametru coeficient corelație cauzalitate aproximare '
                              'extrapolare simulare validare rigoare acuratețe precizie cuantic '
                              'relativitate entropie neuron neurologie genom mutație ereditate '
                              'ereditar sinteză catalizator cuantifica valida extrapola '
                              'sintetiza corela ipotetic paradigmatic'),
    ('philosophy and thought', 'filozofie filozof etică etic morală metafizică ontologie logică '
                               'dialectică raționalism existențialism nihilism relativism '
                               'determinism liber_arbitru transcendență absolut abstract concret '
                               'arbitrar intrinsec inerent implicit explicit paradox '
                               'contradicție  contempla medita idealism pragmatism '
                               'pragmatic utopie utopic'),
    ('language and rhetoric', 'retorică stilistică semantică sintaxă morfologie etimologie '
                              'neologism arhaism regionalism jargon argou eufemism hiperbolă '
                              'ironie sarcasm aluzie conotație ambiguu echivoc succint concis '
                              'elocvent elocvență digresiune parafrază parafraza insinua '
                              'nuanță sintagmă locuțiune'),
    ('society and culture', 'mentalitate civism conformism nonconformism individualism '
                            'colectivism elită elitism emancipare alienare asimilare '
                            'multiculturalism secularizare laic tabu stigmat stigmatiza '
                            'precaritate coeziune demografie natalitate mortalitate '
                            'longevitate îmbătrânire exod emigrant imigrant diasporă '
                            'patriarhat feminism conservatorism'),
    ('character and conduct', 'integritate probitate onestitate ipocrizie ipocrit cinism cinic '
                              'aroganță vanitate orgoliu orgolios modestie umilință generozitate '
                              'meschinărie meschin perfid perfidie viclean viclenie naivitate '
                              'candoare scrupul scrupulos nepăsare indiferență abnegație '
                              'altruism altruist egocentric narcisist pedant inflexibil '
                              'versatil temperament impetuos stoic prudență prudent '
                              'discernământ tact'),
    ('the finer shades of feeling', 'amărăciune mâhnire deznădejde disperat consternare stupoare '
                                    'uimire nedumerire perplexitate jenă stânjeneală remușcare '
                                    'căință resemnare exasperare iritare indignare indignat '
                                    'neliniște nerăbdare apatie letargie extaz încântare '
                                    'exaltare melancolic sumbru morocănos posac exaspera irita '
                                    'indigna mâhni consterna nedumeri descuraja copleși '
                                    'resemna'),
    ('arts and literature', 'estetică canon romantism realism simbolism modernism postmodernism '
                            'suprarealism baroc clasicism proză lirică liric epic dramaturgie '
                            'dramaturg rimă strofă vers sonet baladă elegie satiră parodie '
                            'alegorie protagonist antagonist intrigă deznodământ manuscris '
                            'ediție tiraj prefață antologie traducător traducere '
                            'versiune_originală'),
    ('the environment and the planet', 'ecologie ecologist poluant emisii_de_carbon '
                                       'neutralitate decarbonizare combustibil_fosil '
                                       'regenerabil biomasă deșeu_toxic ploaie_acidă '
                                       'stratul_de_ozon permafrost ghețar topire nivelul_mării '
                                       'calamitate vulnerabilitate reziliență adaptare '
                                       'atenuare'),
    ('the body, health and medicine', 'patologie patologic etiologie prognostic cronic acut '
                                      'benign malign metastază inflamație lezare leziune '
                                      'hemoragie fractură convalescență recidivă sechele '
                                      'paliativ invaziv imunodeficiență contagios '
                                      'epidemiolog incubație carantină'),
    ('register and nuance: adjectives', 'adecvat inadecvat pertinent elocvent ambivalent '
                                        'controversat dezirabil indezirabil admisibil '
                                        'inadmisibil iminent imperativ imperios inevitabil '
                                        'iremediabil ireversibil precar prolific profitabil '
                                        'prosper rudimentar sumar exhaustiv '
                                        'cuprinzător detaliat minuțios superfluu redundant '
                                        'eronat fals_pozitiv ilicit licit tacit vădit '
                                        'flagrant notoriu proeminent emblematic '
                                        'paradoxal ireconciliabil incompatibil compatibil '
                                        'echivalent analog omogen eterogen'),
    ('register and nuance: adverbs and connectors', 'așadar astfel_încât întrucât deoarece '
                                                    'totuși însă ci prin_urmare '
                                                    'în_consecință de_altfel '
                                                    'de_fapt în_fond în_definitiv '
                                                    'cu_precădere preponderent '
                                                    'îndeosebi mai_cu_seamă '
                                                    'eminamente esențialmente '
                                                    'virtualmente inevitabil '
                                                    'implicit explicit oricum '
                                                    'nicidecum câtuși_de_puțin '
                                                    'ba_chiar ori ori_de_câte_ori '
                                                    'pe_măsură_ce odată_ce '
                                                    'ceea_ce cât_despre'),
    ('nuanced verbs', 'atenua accentua agrava ameliora submina compromite periclita prejudicia '
                      'leza eluda eschiva tergiversa temporiza camufla disimula '
                      'intimida constrânge coerciție instiga incita fomenta '
                      'îndemna stimula impulsiona galvaniza mobiliza '
                      'concilia media arbitra intermedia negocia '
                      'stipula prevedea reglementa normaliza standardiza '
                      'legitima discredita defăima calomnia blama '
                      'elogia omagia venera glorifica '
                      'deplânge regreta compătimi '
                      'preconiza prefigura anticipa '
                      'aprofunda detalia sintetiza rezuma '
                      'redacta revizui corecta adnota '
                      'conferi atribui decerna acorda '
                      'exploata valorifica fructifica '
                      'eradica stârpi anihila neutraliza '
                      'perpetua perpetuare consacra institui '
                      'transgresa încălca contraveni '
                      'convoca conveni delibera'),
    ('abstract nouns', 'premisă ipostază dimensiune perspectivă optică viziune concepție '
                       'conceptualizare abordare demers inițiativă tentativă '
                       'deziderat aspirație năzuință idealul utopie '
                       'dilemă impas paradox antiteză sinteză '
                       'consens disensiune divergență convergență '
                       'echilibru dezechilibru ierarhie subordonare '
                       'autonomie dependență interdependență reciprocitate '
                       'continuitate discontinuitate ruptură '
                       'precedent inconsecvență coerență incoerență '
                       'legitimitate validitate pertinență relevanță '
                       'oportunitate oportunism eficiență eficacitate '
                       'prerogativă atribuție competență jurisdicție'),
]

C2 = [
    ('literary and elevated nouns', 'văpaie zbucium freamăt zvâcnire fior taină tăinuire '
                                    'nemărginire nemurire neant genune hău abis prăpastie '
                                    'zare orizont amurg asfințit înserare '
                                    'aurora licărire scânteiere sclipire strălucire pâclă '
                                    'negură bură boare adiere vijelie vâltoare '
                                    'șuvoi pârâiaș izvor clipocit susur foșnet '
                                    'murmur ecou dor_de_ducă '
                                    'alean jale tânguire bocet suspin oftat '
                                    'vrajă farmec nălucă stafie strigoi'),
    ('older words alive in literature', 'cuget cugetare simțire obârșie neam seminție '
                                        'moșie moșier boier boierime vodă domnitor '
                                        'hatman spătar vornic logofăt paharnic '
                                        'haiduc haiducie oștean oaste ostaș pribeag '
                                        'pribegie năvălire năvălitor slujitor '
                                        'hrisov uric pisanie letopiseț cronicar '
                                        'zapis diac grămătic dascăl'),
    ('faith, rite and tradition', 'credincios evlavie evlavios cucernic smerenie smerit '
                                  'pocăință păcat iertăciune mântuire mântuitor '
                                  'sfințenie sfințire binecuvântare blestem afurisenie '
                                  'liturghie utrenie vecernie '
                                  'priveghi parastas pomană colivă praznic hram '
                                  'icoană iconostas candelă tămâie mir botez cununie '
                                  'nănaș naș nașă cumătru colindă colindător '
                                  'sorcova plugușor mărțișor descântec vrăjitoare '
                                  'ursitoare zmeu balaur'),
    ('the countryside and its crafts', 'ogor brazdă arătură semănătură recoltă '
                                       'secere coasă plug grapă îmblăciu treierat '
                                       'stog claie snop căpiță fân otavă '
                                       'stână baci cioban strungă '
                                       'târlă ocol grajd șură hambar pătul '
                                       'fântână cumpănă ciutură prispă cerdac '
                                       'ogradă pârleaz uliță '
                                       'olar olărit fierar potcovar dogar rotar '
                                       'țesătoare război_de_țesut fus furcă caier '
                                       'opincă cojoc ițari '),
    ('rhetoric, style and scholarship', 'erudiție erudit savant exegeză exeget hermeneutică '
                                        'filolog filologie lingvist lingvistică '
                                        'stilist emfază emfatic patetism grandilocvență '
                                        'grandilocvent bombastic pompos prețios '
                                        'manierism manierat epigon '
                                        'pastișă plagiat plagia apocrif canonic '
                                        'polemică polemist polemic pamflet pamfletar '
                                        'apologie apologet encomion panegiric '
                                        'sentențios aforism aforistic '
                                        'adagiu pildă parabolă fabulă'),
    ('law and administration at their most formal', 'uzufruct uzufructuar ipotecar '
                                                    'cesiune cesionar gaj garant fidejusor '
                                                    'sechestru poprire executare_silită '
                                                    'hotărâre_judecătorească sentință_definitivă '
                                                    'definitiv irevocabil revocabil revoca '
                                                    'abrogare derogare derogatoriu '
                                                    'contencios contencios_administrativ '
                                                    'cutumă cutumiar uzanță statuta '
                                                    'emitent beneficiar împuternicit '
                                                    'împuternici mandatar petent petiție '
                                                    'cerere_de_chemare_în_judecată'),
    ('the finest shades of character', 'mârșav mârșăvie josnic josnicie ticăloșie '
                                       'fățarnic fățărnicie '
                                       'lingușitor lingușeală slugarnic slugărnicie '
                                       'servil servilism obedient obediență '
                                       'semeț semeție trufaș trufie fălos '
                                       'încrezut îngâmfat îngâmfare fanfaron '
                                       'cutezător cutezanță temerar temeritate '
                                       'pusilanim pusilanimitate lașitate '
                                       'nevolnic neputincios zelos zel sârguincios '
                                       'sârguință harnicie stăruitor stăruință '
                                       'cumpătat cumpătare chibzuit chibzuință '
                                       'nechibzuit nechibzuință zgârcit zgârcenie '
                                       'risipitor risipă darnic dărnicie '
                                       'blajin blândețe aprig aprindere iute_la_mânie '
                                       'ursuz posomorât taciturn ponderat echilibrat'),
    ('feeling and judgement', 'scârbă dezgust repulsie aversiune oroare '
                              'venerație adorație devoțiune pietate '
                              'sfială sfios pudoare pudic '
                              'rușinare umilire ofensă jignire afront '
                              'ranchiună pică dușmănie vrăjmășie vrăjmaș '
                              'pizmă pizmaș zavistie amar amarnic '
                              'înverșunare înverșunat îndârjire îndârjit '
                              'patimă pătimaș înflăcărare înflăcărat '
                              'fervoare fervent ardoare avânt elan '
                              'tihnă seninătate răgaz '
                              'lehamite plictis spleen'),
    ('precise verbs of speech', 'îngăima bâigui bolborosi mormăi bombăni cârti '
                                'murmura ciripi sporovăi pălăvrăgi trăncăni '
                                'flecări bârfi ponegri '
                                'cleveti tăinui destăinui '
                                'tânji tângui văita boci jelui '
                                'zbiera răcni vocifera '
                                'perora declama recita psalmodia îngâna '
                                'șușoti șopoti ironiza persifla zeflemisi '
                                'lua_peste_picior admonesta dojeni mustra '
                                'ocărî sudui '),
    ('precise verbs of sight, movement and manner', 'întrezări zări desluși '
                                                    'scruta iscodi pândi '
                                                    'holba zgâi mijî clipoci '
                                                    'licări sclipi scânteia pâlpâi '
                                                    'străfulgera fulgera '
                                                    'târșâi șontâcăi șchiopăta '
                                                    'hoinări '
                                                    'colinda cutreiera '
                                                    'tropăi țopăi zburda hârjoni '
                                                    'furișa '
                                                    'încovoia gârbovi zgribuli '
                                                    'ghemui chirci '
                                                    'clătina '
                                                    'zvârcoli zbate zbuciuma frământa '
                                                    'ostoi alina potoli domoli tempera'),
    ('rarer adjectives', 'diafan eteric vaporos străveziu translucid opac '
                         'lăptos sidefiu argintiu purpuriu vișiniu stacojiu '
                         'liliachiu azuriu azur cenușiu plumburiu '
                         'fastuos somptuos opulent luxuriant fastidios '
                         'anost fad insipid searbăd monoton '
                         'lugubru macabru sinistru funest nefast '
                         'ocult esoteric ezoteric enigmatic abscons '
                         'abrupt anevoios sinuos întortocheat labirintic '
                         'efemer trecător perisabil vremelnic peren '
                         'imemorial ancestral străvechi vetust desuet '
                         'arhaic anacronic învechit caduc perimat '
                         'insolit bizar straniu ciudățenie '
                         'prolix verbos laconic lapidar sibilinic '
                         'imaculat neprihănit nepătat curat_ca_lacrima '
                         'ineluctabil implacabil inexorabil '),
    ('rarer adverbs and connectors', 'întocmai aidoma precum_și '
                                     'îndeobște îndeajuns nicicum nicidecum '
                                     'cumva cândva oarecând altminteri '
                                     'totodată deopotrivă laolaltă '
                                     'anevoie lesne cu_greu agale alene '
                                     'tiptil hoțește pe_furiș dinadins '
                                     'anume tocmai bunăoară iarăși '
                                     'odinioară pururea pururi '
                                     'întruna necontenit neîncetat '
                                     'nespus negrăit nemaivăzut '
                                     'ba ci așadar fiindcă întrucât '
                                     'măcar barem cel_mult ori_ba'),
    ('abstract and scholarly nouns', 'sorginte proveniență filiație genealogie '
                                     'quintesență chintesență substrat fundament temei '
                                     '  sofism '
                                     'tautologie pleonasm truism platitudine banalitate '
                                     'dihotomie antinomie aporie apoftegmă '
                                     'deziluzie dezabuzare '
                                     'abulie acedie '
                                     'clarviziune perspicacitate sagacitate '
                                     'iscusință dibăcie măiestrie meșteșug '
                                     'virtuozitate rafinament subtilitate finețe '
                                     'pondere preeminență întâietate '
                                     'izbândă biruință '
                                     'surghiun exil proscriere proscris'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1, 'c2': C2}
