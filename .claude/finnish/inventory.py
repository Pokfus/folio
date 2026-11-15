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

B1 = [
    ('work, money and the economy', 'työnantaja työtön työttömyys ura hakemus haastattelu '
                                    'irtisanoa palkata ylennys vero talous budjetti laina korko '
                                    'säästää tuhlata kuitti lasku tili velka sijoittaa hyöty '
                                    'kustannus tulot meno tarjous alennus '
                                    'kilpailu markkinat tuote palvelu asiakaspalvelu sopimus:noun'),
    ('education', 'koulutus opinnot opiskelu arvosana todistus stipendi luento esitelmä tutkimus '
                  'aine historia maantieto matematiikka kemia fysiikka biologia kielioppi '
                  'ääntäminen käännös kääntää harjoitus tehtävä:noun selitys ymmärrys oppilas '
                  'rehtori päiväkoti'),
    ('the news, media and technology', 'sanomalehti aikakauslehti toimittaja haastatella '
                                       'artikkeli otsikko mainos televisio radio ohjelma kanava '
                                       'internet verkkosivu sähköposti viesti:noun tietokone '
                                       'näyttö näppäimistö ladata tallentaa salasana sovellus '
                                       'älypuhelin akku laite tekniikka julkaista'),
    ('government, law and society', 'hallitus valtio eduskunta ministeri pääministeri vaali '
                                    'äänestää puolue politiikka laki rikos rikollinen tuomari '
                                    'oikeudenkäynti varas varkaus sakko kansalainen yhteiskunta '
                                    'kunta väestö maahanmuuttaja oikeus:noun vapaus tasa-arvo '
                                    'demokratia mielenosoitus armeija sotilas rauha'),
    ('the environment and the weather', 'ympäristö ilmasto saaste kierrättää jäte roska '
                                        'luonnonsuojelu sähkö energia lämpötila sääennuste '
                                        'kuivuus tulva helle lämmetä '
                                        'kylmetä sulaa jäätyä'),
    ('health and medicine', 'sairaus tauti oire hoito leikkaus potilas lääkitys rokote allergia '
                            'stressi masennus uni:noun liikunta ruokavalio terveellinen '
                            'epäterveellinen vointi tutkia:verb ensiapu ambulanssi päivystys'),
    ('travel and transport', 'liikenne ruuhka moottoritie risteys kaista nopeus ajokortti '
                             'polttoaine bensiini tankata lento lähtöselvitys matkatavara '
                             'yöpyä nähtävyys matkailu matkatoimisto kulkuneuvo raitiovaunu '
                             'metro satama'),
    ('the household and its chores', 'kotityö tiskata silittää pyykki lakana roskapussi '
                                     'remontti korjaus vuokralainen omistaja kalusteet sähkölasku '
                                     'naapurusto lämmitys'),
    ('relationships and the stages of life', 'suhde:noun avioliitto mennä_naimisiin erota avioero '
                                             'seurustella rakastua kihlautua häät syntymäpäivä '
                                             'lapsuus nuoruus vanhuus kuolema hautajaiset raskaus '
                                             'synnyttää kasvattaa sukupolvi ystävyys'),
    ('feelings and character', 'tunteellinen luonne käytös luottamus kateus häpeä ylpeys '
                               'pettymys helpotus innostus kiinnostus kiinnostunut '
                               'tyytyväinen tyytymätön itsekäs rehellinen epärehellinen '
                               'kärsivällinen kunnianhimoinen avulias luotettava'),
    ('religion and festivals', 'uskonto usko kristitty kirkko:noun rukoilla joulu pääsiäinen '
                               'juhannus vappu itsenäisyyspäivä juhlia perinne tapa:noun'),
    ('ideas, reasons and plans', 'mielipide näkökulma syy:noun seuraus tarkoitus:noun tavoite '
                                 'suunnitelma vaihtoehto ratkaisu ongelma:noun ehdotus '
                                 'päätös:noun mahdollisuus kokemus tieto:noun taito kyky '
                                 'merkitys vaikutus ero:noun etu haitta'),
    ('connectors', 'kuitenkin vaikka:conj siksi koska:conj jotta lisäksi myöskin sen_sijaan '
                   'toisaalta esimerkiksi nimittäin siis:adv ensinnäkin lopulta kuten:conj '
                   'paitsi:conj samalla jolloin joten:adv mikäli ellei'),
    ('words for describing', 'tärkeä mielenkiintoinen tavallinen erilainen samanlainen '
                             'yksinkertainen monimutkainen tarpeellinen hyödyllinen '
                             'mahdoton turvallinen vaarallinen terve:adj sopiva kohtuullinen '
                             'nykyaikainen perinteinen julkinen yksityinen kansainvälinen '
                             'paikallinen virallinen yleinen harvinainen'),
    ('verbs of thinking, deciding, arguing and changing', 'harkita pohtia miettiä olettaa '
                                                          'epäillä:verb päättää:verb suunnitella '
                                                          'ehdottaa väitellä kiistää vakuuttaa '
                                                          'neuvotella sopia:verb hyväksyä:verb '
                                                          'vastustaa kannattaa:verb arvostella '
                                                          'kehittää kehittyä parantaa '
                                                          'vähentää lisätä kasvaa:verb '
                                                          'muuttua:verb vertailla verrata '
                                                          'kuvailla mainita keskustella'),
]

B2 = [
    ('politics and public administration', 'hallinto viranomainen virasto virkamies päätöksenteko '
                                           'lainsäädäntö asetus hallitusohjelma oppositio koalitio '
                                           'kansanedustaja presidentinvaalit ehdokas kampanja '
                                           'äänestys enemmistö vähemmistö kannatus uudistus '
                                           'vaalipiiri valtuusto kunnallinen julkishallinto '
                                           'byrokratia diplomatia suurlähettiläs suurlähetystö '
                                           'ulkopolitiikka sisäpolitiikka puolustus turvallisuuspolitiikka'),
    ('the law and the courts', 'tuomioistuin oikeusjuttu syytetty asianomistaja todistus:noun '
                               'todistaja:noun valitus vankeus ehdonalainen tutkintavankeus '
                               'sopimusrikkomus korvaus vahingonkorvaus perustuslaki '
                               'ihmisoikeus syrjintä rangaistus rikoslaki lainvastainen laillinen '
                               'oikeudenmukainen kiistellä vedota kieltää:verb'),
    ('the economy and finance', 'talouskasvu taantuma lama inflaatio työllisyys tuotanto kulutus '
                                'kuluttaja vienti tuonti kauppatase investointi sijoittaja osake '
                                'osakemarkkinat pörssi rahoitus valuutta pankkitili luotto '
                                'tilintarkastus kirjanpito liikevaihto kilpailija '
                                'yrittäjä toimitusjohtaja konserni tukiainen tuki:noun verotus '
                                'kannattava kannattamaton'),
    ('science and research', 'tiede tieteellinen tutkija:noun koe:noun hypoteesi teoria:noun '
                             'menetelmä tulos:noun havainto aineisto tilasto analyysi '
                             'johtopäätös näyttö:noun todennäköisyys laboratorio kokeilu '
                             'keksintö löytö ilmiö rakenne prosessi'),
    ('technology', 'teknologia ohjelmisto laitteisto tekoäly algoritmi tietoturva tietokanta '
                   'verkko palvelin käyttäjä käyttöliittymä päivitys digitaalinen automaatio '
                   'robotti innovaatio kehitys tuotekehitys'),
    ('the environment and natural resources', 'ilmastonmuutos kasvihuonekaasu päästö hiilidioksidi '
                                              'uusiutuva aurinkoenergia tuulivoima ydinvoima '
                                              'luonnonvara metsätalous kaivos öljy:noun '
                                              'kestävä kestävyys monimuotoisuus sukupuutto '
                                              'saastuminen jätehuolto ekologinen suojelualue'),
    ('health and the mind', 'mielenterveys psykologi psykiatri terapia ahdistus uupumus '
                            'riippuvuus diagnoosi sairaanhoito terveydenhuolto kansanterveys '
                            'ehkäisy elinajanodote hyvinvointi aivot hermosto immuniteetti '
                            'tulehdus krooninen'),
    ('the arts, literature and the media', 'kirjallisuus romaani runo runoilija kirjailija '
                                           'teos julkaisu kustantaja arvostelu:noun kriitikko '
                                           'taiteilija veistos maalaus näytelmä ohjaaja '
                                           'elokuvaohjaaja sävellys säveltäjä orkesteri '
                                           'tiedotusväline lehdistö sananvapaus sensuuri '
                                           'propaganda some'),
    ('history and society', 'historiallinen vuosikymmen aikakausi sivilisaatio imperiumi siirtomaa '
                            'itsenäisyys sisällissota vallankumous kansakunta kansallinen '
                            'kulttuuri identiteetti vähemmistö:noun maahanmuutto pakolainen '
                            'köyhyys eriarvoisuus hyvinvointivaltio sosiaaliturva eläke '
                            'työväenluokka keskiluokka'),
    ('argument and evaluation', 'väite perustelu todiste:noun peruste näkemys kanta:noun kritiikki '
                                'arvio arviointi johtopäätös syy-yhteys seuraus:noun vaikutus:noun '
                                'tekijä:noun edellytys rajoitus ristiriita vastaväite '
                                'kiistanalainen perusteltu ilmeinen epäselvä vakuuttava '
                                'merkittävä olennainen keskeinen'),
    ('formal connectors', 'kuitenkaan mutta:conj sen_vuoksi tämän_vuoksi näin_ollen siitä_huolimatta '
                          'puolestaan toisin_sanoen esimerkiksi:adv eritoten etenkin varsinkin '
                          'lähinnä ainoastaan niin_ikään vastaavasti samoin:adv lisäksi:adv '
                          'joskin vaikkakin sikäli kunhan:conj'),
    ('words for describing', 'tehokas tehoton luotettava:adj kattava yksityiskohtainen yleinen:adj '
                             'abstrakti konkreettinen vastaava erillinen jatkuva väliaikainen '
                             'pysyvä nopea:adj hidas merkityksetön ratkaiseva monipuolinen '
                             'ainutlaatuinen keskimääräinen huomattava vähäinen'),
    ('verbs of reporting, analysing and persuading', 'todeta korostaa painottaa huomauttaa '
                                                     'tiivistää analysoida tulkita arvioida '
                                                     'perustella todistaa:verb osoittaa:verb '
                                                     'kumota suostutella vakuuttaa:verb '
                                                     'väittää:verb myöntää:verb kyseenalaistaa '
                                                     'edistää heikentää vahvistaa:verb '
                                                     'ennustaa raportoida tiedottaa ilmaista '
                                                     'edustaa määritellä soveltaa toteuttaa'),
]

C1 = [
    ('philosophy and ethics', 'filosofia filosofi etiikka eettinen moraali moraalinen arvo:noun '
                              'hyve pahe velvollisuus:noun omatunto:noun oikeudenmukaisuus '
                              'vapaa_tahto tietoisuus olemassaolo:noun todellisuus:noun '
                              'totuus:noun järki:noun tieto-oppi käsite periaate:noun '
                              'ihanne aate ideologia maailmankuva ihmiskuva'),
    ('religion and the inner life', 'hengellinen uskonnollinen pyhyys jumalanpalvelus '
                                    'seurakunta pappi:noun usko:noun epäusko ateisti '
                                    'mietiskely sisäinen:adj sielunelämä armo:noun '
                                    'pelastus:noun kuolemanjälkeinen'),
    ('scholarly Finnish', 'tutkielma väitöskirja opinnäyte lähde:noun lähdeluettelo viittaus '
                          'lainaus tiivistelmä johdanto käsitteistö teoreettinen empiirinen '
                          'metodologia otos muuttuja tulkinta näkökanta oletus premissi '
                          'päätelmä yleistys luokittelu vertailu:noun'),
    ('government, diplomacy and the constitution', 'perustuslaillinen täysivaltainen suvereniteetti '
                                                   'kansanäänestys parlamentaarinen '
                                                   'tasavalta monarkia valtionpäämies '
                                                   'kansainvälinen_oikeus sopimuspuoli '
                                                   'liittolaisuus puolueettomuus pakote '
                                                   'valtuuskunta '
                                                   'ulkoministeriö yhteisymmärrys '
                                                   'lainsäätäjä toimeenpanovalta'),
    ('the economy and development', 'kehitysmaa kehitysyhteistyö globalisaatio talouspolitiikka '
                                    'valtionvelka alijäämä ylijäämä '
                                    'tuottavuus kilpailukyky bruttokansantuote '
                                    'yksityistäminen sääntely markkinatalous rakennemuutos '
                                    'kestävä_kehitys'),
    ('medicine and the body', 'lääketiede elimistö aineenvaihdunta verenkierto '
                              'sairauskertomus oireyhtymä perinnöllinen geeni perimä '
                              'synnynnäinen kuntoutus haittavaikutus annostus '
                              'leikkaushoito ennaltaehkäisy'),
    ('law and rights', 'oikeusvaltio oikeusturva kansalaisoikeus sananvapaus:noun '
                       'yksityisyys yhdenvertaisuus oikeuskäytäntö ennakkotapaus '
                       'syyttömyysolettama todistustaakka valitusoikeus lainvoimainen '
                       'sopimusehto vastuuvelvollisuus'),
    ('language and literature', 'kielitiede murre sanasto merkitysoppi kielioppi:noun '
                                'lauseoppi sananlasku vertauskuva metafora ironia '
                                'kertoja juoni:noun henkilöhahmo lyriikka proosa '
                                'kirjallisuudentutkimus käännöskirjallisuus klassikko '
                                'tyylikeino'),
    ('the shades of feeling and judgement', 'kaipaus haikeus katkeruus mielipaha nöyryys '
                                            'kunnioitus:noun ihailu halveksunta myötätunto '
                                            'epäluulo vastenmielisyys innoittaa '
                                            'kyyninen naiivi hienotunteinen ylimielinen '
                                            'tunnollinen pidättyväinen herkkätunteinen '
                                            'suvaitsevainen ennakkoluuloinen'),
    ('abstract nouns of formal prose', 'ilmentymä näkökohta lähtökohta painopiste '
                                       'taustatekijä suuntaus kehityskulku '
                                       'mittakaava ulottuvuus kokonaisuus '
                                       'monimuotoisuus:noun epävarmuus '
                                       'vastakkainasettelu ristiriitaisuus '),
    ('abstract adjectives', 'perustavanlaatuinen olennainen:adj ilmeinen:adj kiistaton '
                            'moniulotteinen yksiselitteinen monitahoinen johdonmukainen '
                            'epäjohdonmukainen asiallinen asiaton puolueeton puolueellinen '
                            'pätevä merkityksellinen vertailukelpoinen ennennäkemätön '
                            'vallitseva'),
    ('literary connectors and adverbs', 'täten siten:adv niin_ollen ylipäätään kaiken_kaikkiaan '
                                        'tosin:adv sinänsä ilmeisesti:adv '
                                        'nähtävästi oletettavasti kenties:adv '
                                        'päinvastoin:adv vastedes '
                                        'kuitenkin:adv silti:adv tuolloin'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
