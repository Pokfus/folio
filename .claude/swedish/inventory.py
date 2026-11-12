#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Swedish word list was found published (see `swedish_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`en:article`) where the
spelling is shared and the level wants one reading first.  An underscore joins
a two-word entry (`god_morgon`).  Spellings are Wiktionary's headwords: a verb
by its infinitive (`äta`), a noun in the indefinite singular (a plural-only
noun in the plural: `pengar`), an adjective in its common-gender form.
"""

A1 = [
    ('pronouns', 'jag du han hon den det vi ni de man:pron mig dig honom henne oss dem sig '
                 'min:pron din hans hennes vår er deras sin:pron'),
    ('articles', 'en:article'),
    ('questions', 'vad vem var:adv vart när varför hur vilken'),
    ('prepositions and place words', 'i på:prep till:prep från med:prep utan:prep för:prep av:prep om under över:prep efter:prep före hos '
                                     'bredvid mellan framför bakom vid:prep här där hem hemma ute inne '
                                     'upp ner bort nära'),
    ('conjunctions and little words', 'och eller men att som:pron eftersom så inte ja nej jo också bara '
                                      'mycket lite kanske alltid aldrig ofta ibland redan igen '
                                      'nu sedan snart'),
    ('greetings and politeness', 'hej hejdå tack varsågod förlåt ursäkta god_morgon god_natt '
                                 'välkommen okej'),
    ('numbers', 'noll två tre fyra fem sex sju åtta nio tio elva tolv tjugo trettio femtio hundra '
                'tusen första andra:adj tredje halv'),
    ('time', 'tid timme minut dag natt morgon kväll eftermiddag idag imorgon igår vecka månad år '
             'klocka tidig sen:adj'),
    ('days', 'måndag tisdag onsdag torsdag fredag lördag söndag'),
    ('months', 'januari februari mars april maj juni juli augusti september oktober november '
               'december'),
    ('family', 'familj mamma pappa mor far bror syster son dotter kvinna fru make barn pojke flicka '
               'mormor farmor morfar farfar vän kompis bebis'),
    ('people and yourself', 'namn ålder land stad språk svenska engelska arbete jobb elev student '
                            'lärare läkare människa person'),
    ('food and drink', 'mat vatten kaffe te mjölk bröd vin öl ost kött fisk ägg frukt äpple apelsin '
                       'tomat sallad socker salt frukost lunch middag potatis ris smör glass'),
    ('shopping and money', 'pengar krona pris affär butik köpa sälja betala kosta billig dyr'),
    ('the home', 'hus lägenhet rum dörr fönster bord stol säng kök badrum toalett bok penna telefon '
                 'nyckel'),
    ('the town and getting about', 'gata väg bil buss tåg taxi biljett station hotell sjukhus '
                                   'skola:noun kontor bank höger vänster rakt flygplats hav '
                                   'restaurang apotek cykel'),
    ('the body and feeling ill', 'huvud öga öra näsa mun hand arm ben fot mage tand sjuk frisk '
                                 'ont medicin feber'),
    ('weather', 'väder varm kall regn sol vind:noun snö regna'),
    ('colours', 'färg röd blå gul grön svart vit brun'),
    ('describing', 'stor liten ny gammal ung fin bra dålig glad ledsen lång kort lätt svår många '
                   'all varje ingenting trött hungrig'),
    ('everyday verbs', 'vara ha göra:verb gå komma äta dricka sova vakna sitta se höra prata säga läsa '
                       'skriva förstå veta kunna vilja:verb ska:verb måste få:verb bo heta tycka öppna stänga '
                       'fråga:verb svara tänka älska arbeta lära:verb titta lyssna ta ge åka resa:verb hjälpa '
                       'hitta'),
]

# A2 (2026-11-12): the CEFR A2 descriptor's "areas of most immediate relevance" --
# the Swahili A2 topic list adapted.  Words A1 teaches are skipped by `select.py`.
A2 = [
    ('seasons and dates', 'årstid vår:noun sommar höst vinter helg semester jul påsk födelsedag '
                          'kalender datum sekund kvart'),
    ('more numbers', 'fjorton femton sexton sjutton arton nitton fyrtio sextio sjuttio åttio nittio '
                     'miljon fjärde femte dubbel'),
    ('the land and nature', 'natur skog berg sjö flod älv strand ö fält träd blomma gräs sten '
                            'himmel stjärna måne jord landsbygd park'),
    ('weather', 'moln molnig blåsa:verb storm is grad temperatur kyla värme dimma åska blöt torr'),
    ('animals', 'djur hund katt häst ko gris får:noun höna fågel:noun mus kanin björn varg älg'),
    ('clothes', 'kläder tröja byxa kjol klänning skjorta jacka rock mössa sko strumpa '
                'hatt väska handske glasögon storlek klä'),
    ('the home and the kitchen', 'trädgård vägg golv tak trappa soffa lampa skåp hylla matta '
                                 'spis kylskåp ugn tallrik kopp glas kniv gaffel sked kastrull '
                                 'diska städa tvätta laga:verb hyra granne'),
    ('food and cooking', 'grönsak morot lök kyckling korv skinka gurka banan jordgubbe '
                         'soppa kaka tårta juice godis sås peppar olja mjöl smörgås '
                         'koka steka baka smaka god:adj söt sur'),
    ('work and jobs', 'chef kollega företag lön möte yrke sjuksköterska polis bonde kock '
                      'säljare ingenjör tjänst anställa arbetslös ansöka'),
    ('school and learning', 'klass lektion läxa prov kurs universitet fråga:noun svar ord mening '
                            'övning betyg papper dator plugga'),
    ('travel and transport', 'resa:noun flyg flygplan båt tunnelbana spårvagn hållplats '
                             'pass resväska karta semester turist utland ankomst avgång '
                             'försening missa landa stiga byta'),
    ('the town', 'centrum torg kyrka museum bibliotek bio teater post polisstation '
                 'bensinstation parkering hörn bro korsning kvarter förort'),
    ('health', 'kropp hjärta rygg hals finger knä blod tandläkare vårdcentral recept '
               'förkyld hosta värk skadad må vila'),
    ('feelings', 'känsla arg orolig nervös lycklig besviken förvånad rädsla kärlek '
                 'skratta gråta oroa sakna hata'),
    ('free time', 'fritid sport fotboll match musik sång film bild konst spel resa '
                  'simma springa dansa sjunga måla träna fiska promenad bok läsa vandra'),
    ('everyday verbs', 'bära visa:verb lägga:verb ställa vända vinna förlora börja sluta '
                       'tappa välja bestämma glömma minnas lova låna hyra skicka få:verb '
                       'ändra jämföra förklara beskriva boka beställa vänta stiga'),
    ('describing things and people', 'hög låg bred smal tjock tunn tung mjuk hård snabb '
                                     'långsam ren:adj smutsig tyst högljudd vacker ful snäll elak '
                                     'rolig tråkig intressant viktig vanlig konstig enkel '
                                     'mörk ljus:adj full tom öppen stängd blond trevlig'),
    ('time words', 'ofta sällan alltid ibland strax genast fortfarande senare '
                   'förut förr nyss medan ännu dagligen'),
    ('connectors', 'därför fast:conj trots om:conj innan när:conj medan också dessutom '
                   'alltså ändå kanske antingen varken utom'),
]

# B1 (2026-11-12): the CEFR B1 descriptor's "familiar matters regularly encountered in
# work, school, leisure", plus experiences, events, hopes and opinions.
B1 = [
    ('work and the economy', 'ekonomi arbetsgivare arbetstagare anställd lärling praktik utbildning '
                             'erfarenhet ansökan intervju avtal kontrakt skatt kostnad inkomst '
                             'pension fack strejk vinst förlust marknad kund tjänsteman '
                             'heltid deltid övertid uppsägning befordran'),
    ('society and politics', 'samhälle politik politiker val:noun parti riksdag kommun land:noun '
                             'medborgare invandrare flykting demokrati rättighet skyldighet '
                             'lag:noun myndighet domstol brott:noun straff polisanmälan '
                             'rösta demonstration kung:noun'),
    ('media and technology', 'tidning:noun nyhet artikel program kanal internet hemsida '
                             'mejl lösenord app skärm tangentbord ladda skriva_ut spara:verb '
                             'radera surfa annons reklam'),
    ('the environment', 'miljö klimat natur:noun luft:noun förorening avfall återvinning '
                        'energi el bensin utsläpp skydda:verb jordbruk landskap '
                        'översvämning torka:noun'),
    ('education', 'skola:noun gymnasium högskola ämne examen uppsats föreläsning lärobok '
                  'studera elev:noun rektor termin kunskap'),
    ('relationships and family life', 'förhållande relation äktenskap skilsmässa sambo pojkvän '
                                      'flickvän vänskap släkt släkting kusin moster faster morbror '
                                      'svärmor barnbarn tonåring uppväxt bröllop:noun begravning '
                                      'träffas umgås'),
    ('home and housing', 'bostad hyresgäst hyresvärd villa radhus flytta:verb renovera möbel '
                         'uppvärmning el:noun grannskap tvättmaskin diskmaskin dammsugare '
                         'balkong källare vind:noun'),
    ('health and the body', 'hälsa sjukdom skada:noun smärta behandling operation vaccin '
                            'allergi stress sömn motion kost vikt:noun lunga mage:noun '
                            'skelett muskel hud blodtryck akut ambulans undersökning'),
    ('travel and experiences', 'resebyrå bokning utflykt sevärdhet upplevelse äventyr '
                               'utsikt boende vandrarhem tält gräns:noun tull valuta '
                               'kust fjäll vattenfall'),
    ('culture and leisure', 'kultur konsert utställning roman författare dikt målning '
                            'konstnär föreställning publik scen tradition fest:noun '
                            'midsommar högtid hobby intresse'),
    ('feelings and opinions', 'åsikt mening:noun tro:noun hopp:noun oro besvikelse glädje '
                              'sorg skam avund stolthet förtroende tvivel '
                              'hålla_med tycka_om föredra anse påstå tvivla övertyga'),
    ('thinking and talking', 'förklaring exempel fråga:noun problem:noun lösning förslag diskussion '
                             'argument fördel nackdel orsak följd resultat syfte '
                             'jämförelse skillnad likhet beskrivning'),
    ('verbs of B1', 'påverka utveckla förbättra minska öka ersätta undvika upprepa '
                    'kritisera klaga uppmuntra stödja organisera delta:verb genomföra '
                    'besluta föreslå rekommendera erbjuda:verb kräva:verb tillåta förbjuda '
                    'lyckas misslyckas uppleva överraska imponera'),
    ('describing and judging', 'nöjd missnöjd orättvis rättvis självständig ansvarsfull '
                               'pålitlig nyfiken envis blyg modig lat flitig ärlig:adj '
                               'allvarlig positiv negativ nödvändig möjlig:adj omöjlig '
                               'tillräcklig lagom bekväm obekväm offentlig privat '
                               'modern traditionell ekonomisk politisk social'),
    ('time and frequency', 'förr_i_tiden numera hittills framöver samtidigt '
                           'så_småningom slutligen ständigt plötsligt emellanåt '
                           'vardag århundrade decennium'),
    ('connectors and argument', 'däremot dessutom därför_att eftersom '
                                'såvida medan fastän alltså nämligen '
                                'å_andra_sidan till_exempel till_slut i_alla_fall '
                                'slutligen hursomhelst'),
]

# B2 (2026-11-12): the CEFR B2 descriptor's "complex text on both concrete and abstract
# topics", technical discussion in one's field, and arguing a viewpoint.
B2 = [
    ('the economy and work', 'konjunktur inflation ränta lån:noun investering aktie budget '
                             'tillväxt arbetslöshet näringsliv bransch konkurrens export import '
                             'handel:noun företagare entreprenör ledning styrelse anställning '
                             'arbetsmarknad fackförening förhandling lönsam'),
    ('politics and the state', 'regering opposition minister statsminister riksdagsledamot '
                               'lagstiftning reform förordning beslut:noun valrörelse '
                               'majoritet minoritet ideologi propaganda korruption '
                               'yttrandefrihet integration diskriminering '
                               'jämställdhet välfärd bistånd'),
    ('law and justice', 'rättssystem advokat:noun dom:noun åtal rättegång:noun vittnesmål bevisning '
                        'skyldig:adj oskyldig:adj fängelsestraff böter brottslighet utredning'),
    ('science and technology', 'vetenskap forskning forskare teori:noun hypotes metod analys '
                               'undersökning:noun upptäckt:noun uppfinning teknologi utveckling '
                               'digital programvara algoritm data:noun artificiell intelligens'),
    ('the environment and resources', 'klimatförändring växthuseffekt koldioxid fossil förnybar '
                                      'hållbar hållbarhet resurs naturresurs utrotning mångfald '
                                      'ekosystem kärnkraft vindkraft solenergi'),
    ('health and society', 'folkhälsa vårdnad sjukvård psykisk depression ångest beroende '
                           'missbruk rehabilitering livsstil förebygga'),
    ('media and communication', 'journalistik källa:noun censur opinion '
                                'debatt:noun kommunikation budskap tolkning publicera '
                                'kommentera granska'),
    ('culture and society', 'identitet mångkultur generation:noun värdering norm fördom '
                            'religion tro:noun sekulär globalisering migration '
                            'befolkning klass:noun jämlikhet'),
    ('abstract nouns', 'aspekt faktor villkor:noun förutsättning konsekvens innebörd sammanhang '
                       'perspektiv tendens utmaning hinder möjlighet:noun begränsning '
                       'påverkan inflytande:noun ansvar:noun avsikt:noun strategi prioritet '
                       'kvalitet kvantitet process struktur funktion'),
    ('arguing and reasoning', 'hävda betona understryka ifrågasätta motivera '
                              'anta:verb förutsätta konstatera bedöma utvärdera analysera '
                              'tolka sammanfatta argumentera motsäga invända medge '
                              'tydliggöra belysa'),
    ('verbs of B2', 'åstadkomma genomföra:verb tillämpa etablera upprätthålla bidra '
                    'främja motverka förhindra:verb begränsa anpassa omfatta medföra '
                    'framhålla förespråka avstå underlätta försvåra förorsaka '
                    'utnyttja:verb förstärka försvaga'),
    ('describing and evaluating', 'omfattande betydande avgörande väsentlig grundläggande '
                                  'komplex invecklad tvetydig entydig hållbar:adj effektiv '
                                  'kontroversiell objektiv subjektiv rimlig orimlig '
                                  'tillförlitlig relevant aktuell befintlig främst '
                                  'uppenbar sannolik osannolik'),
    ('connectors and discourse', 'emellertid således följaktligen dock oavsett:prep '
                                 'beträffande angående gällande i_synnerhet trots_allt '
                                 'å_ena_sidan '
                                 'enligt:prep huruvida dessförinnan därmed'),
]

# C1 (2026-11-12): the CEFR C1 descriptor's "wide range of demanding, longer texts",
# implicit meaning, and flexible use for social, academic and professional purposes.
C1 = [
    ('academic and intellectual', 'avhandling empiri empirisk teoretisk begrepp '
                                  'definition slutledning kriterium fenomen '
                                  'mekanism variabel korrelation urval metodik källkritik '
                                  'abstrakt konkret:adj principiell'),
    ('society and governance', 'förvaltning myndighetsutövning offentlighet medborgarskap '
                               'samhällsdebatt folkomröstning mandatperiod regeringsform '
                               'grundlag maktdelning rättsstat yttrande:noun sanktion '
                               'tillsyn befogenhet'),
    ('economy and business', 'omsättning kapital:noun skuldsättning '
                             'lågkonjunktur högkonjunktur nedskärning effektivisering '
                             'upphandling avkastning intressent'),
    ('law and ethics', 'etik moralisk:adj integritet rättssäkerhet '
                       'överträdelse påföljd preskription prejudikat ändamål'),
    ('mind and behaviour', 'medvetenhet drivkraft motivation:noun '
                           'självkänsla självförtroende sårbarhet tillit:noun ambivalens '
                           'förnekelse förträngning'),
    ('language and rhetoric', 'retorik nyans ironi metafor underton formulering '
                              'framställning resonemang ståndpunkt invändning '
                              'medgivande uttryck:noun'),
    ('abstract nouns', 'innebörd:noun förhållningssätt omständighet:noun företeelse '
                       'skeende förlopp avvägning helhet beståndsdel särdrag '
                       'mångtydighet motsättning förutsägbarhet'),
    ('verbs of C1', 'åskådliggöra problematisera nyansera precisera kartlägga '
                    'påvisa belägga förutspå åberopa vidhålla bestrida '
                    'tillgodose åtgärda prioritera tillskriva frångå åsidosätta '
                    'ifrågasätta:verb härleda'),
    ('adjectives of C1', 'påtaglig ingående övergripande otvetydig '
                         'motstridig ensidig välgrundad ohållbar '
                         'genomgripande avsevärd marginell försumbar oumbärlig '
                         'oförutsägbar tvivelaktig'),
    ('formal connectors', 'därtill därjämte varvid varigenom härvid sålunda icke_desto_mindre '
                          'i_synnerhet:adv förvisso visserligen huruvida:conj '
                          'oaktat jämte'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
