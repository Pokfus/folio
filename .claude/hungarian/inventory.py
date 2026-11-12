#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Hungarian word list was found published (see `hungarian_level.py`),
so a level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`fog:noun`) where one
spelling is two words and the level wants one reading first; an underscore is a
space (`jó_reggelt`).  Spellings are Wiktionary's headwords: a verb by its
third person singular present, the form Hungarian dictionaries list (`eszik`
"eats", `lát` "sees"), a noun and an adjective in the nominative singular.  An
alternative spelling Wiktionary files under another headword (`hová` for
`hova`) resolves through it, and the card prints the spelling written here.
"""

A1 = [
    ('pronouns', 'én te ő mi ti ők maga ön ez az'),
    ('articles', 'a egy:article'),
    ('questions', 'mi ki hol hova honnan mikor miért hogyan hány mennyi melyik milyen'),
    ('postpositions and place words', 'alatt felett mellett előtt mögött között után nélkül '
                                      'itt ott bent kint fent közel messze jobbra balra egyenesen'),
    ('conjunctions and particles', 'és vagy:conj de:conj hogy:conj mert ha is nem igen ne sem csak már még nagyon '
                                   'talán persze nincs'),
    ('greetings and politeness', 'szia szervusz helló jó_reggelt jó_napot jó_estét jó_éjszakát '
                                 'viszlát köszönöm kösz kérem bocsánat elnézést tessék'),
    ('numbers', 'egy:num kettő két három négy öt hat hét nyolc kilenc tíz tizenegy húsz harminc '
                'negyven ötven száz ezer első második harmadik fél'),
    ('time', 'idő óra perc nap éjszaka reggel este délután délelőtt dél ma holnap tegnap most '
             'majd hónap év korán későn mindig soha gyakran'),
    ('days', 'hétfő kedd szerda csütörtök péntek szombat vasárnap'),
    ('months', 'január február március április május június július augusztus szeptember '
               'október november december'),
    ('family', 'család anya apa anyuka testvér báty öcs nővér húg fiú lány férj feleség nagymama '
               'nagypapa gyerek baba barát barátnő férfi nő'),
    ('people and yourself', 'név kor ország város falu nyelv magyar angol munka diák tanár orvos '
                            'ember úr hölgy'),
    ('food and drink', 'étel víz kávé tea tej kenyér bor sör sajt hús hal tojás gyümölcs alma '
                       'narancs paradicsom saláta cukor só reggeli ebéd vacsora krumpli rizs leves vaj'),
    ('shopping and money', 'pénz forint euró ár bolt üzlet piac olcsó drága vesz elad fizet ad kap'),
    ('the home', 'ház lakás szoba ajtó ablak asztal szék ágy konyha fürdőszoba könyv toll telefon '
                 'kulcs'),
    ('the town and getting about', 'utca út autó busz vonat taxi jegy állomás szálloda kórház '
                                   'iskola iroda bank étterem gyógyszertár repülőtér tenger'),
    ('the body and feeling ill', 'fej szem fül orr száj kéz láb has fog:noun beteg fáj gyógyszer láz'),
    ('weather', 'időjárás meleg hideg eső szél hó esik süt'),
    ('colours', 'szín piros kék sárga zöld fekete fehér barna szürke'),
    ('describing', 'nagy kicsi kis új régi szép jó rossz boldog magas alacsony könnyű nehéz sok '
                   'kevés minden egész valami semmi valaki senki'),
    ('everyday verbs', 'van lesz csinál megy jön eszik iszik alszik felkel ül lát néz hall beszél '
                       'mond olvas ír ért tud akar szeret tetszik lakik él sétál talál kinyit becsuk '
                       'kérdez gondol dolgozik tanul kér kell vár'),
]

A2 = [
    ('people and relatives', 'unoka unokatestvér nagybácsi nagynéni nagyszülő szülő rokon após anyós '
                             'vő meny vőlegény menyasszony kamasz fiatal idős nyugdíjas kolléga főnök '
                             'vendég ügyfél szomszéd idegen külföldi'),
    ('jobs and study', 'foglalkozás mérnök ügyvéd rendőr eladó szakács sofőr ápoló pincér titkár '
                       'munkás igazgató fizetés cég gyár munkahely alkalmazott egyetem főiskola '
                       'gimnázium osztály óra lecke házi_feladat vizsga jegy füzet szótár tanfolyam '
                       'diploma'),
    ('clothes', 'ruha szoknya nadrág ing blúz póló pulóver dzseki kabát cipő csizma zokni '
                'kalap sapka kesztyű sál öltöny öv zseb méret felvesz levesz hord visel'),
    ('food and cooking', 'csirke disznó marha hagyma fokhagyma répa sárgarépa káposzta uborka paprika '
                         'bab borsó gomba citrom szőlő körte eper cseresznye banán sütemény torta '
                         'csokoládé fagylalt keksz olaj méz tejföl joghurt liszt bors szósz köret '
                         'desszert tányér pohár csésze kanál villa kés fazék serpenyő főz süt vág '
                         'íz éhes szomjas finom édes sós savanyú keserű friss'),
    ('the home', 'emelet földszint lépcső erkély kert fal padló mennyezet tető előszoba nappali '
                 'hálószoba bútor szekrény polc kanapé fotel szőnyeg függöny tükör lámpa hűtő '
                 'tűzhely sütő mosógép zuhany mosdó törölköző szappan párna takaró bérlet '
                 'költözik takarít mos'),
    ('the town and its services', 'központ kerület park múzeum színház mozi könyvtár templom posta '
                                  'városháza rendőrség híd sarok lámpa járda parkoló '
                                  'benzinkút áruház pékség kávézó kocsma tér térkép'),
    ('travel and holidays', 'utazás szabadság nyaralás kirándulás csomag bőrönd útlevél vízum vám '
                            'határ szállás turista idegenvezető strand hegy tó folyó sziget '
                            'erdő mező domb völgy táj metró villamos kerékpár motor hajó '
                            'kikötő peron megálló menetrend késés indulás érkezés repülőgép járat utazik '
                            'foglal meglátogat'),
    ('nature, seasons and the compass', 'tavasz nyár ősz tél évszak észak dél:noun kelet nyugat ég felhő '
                                        'csillag hold nap:noun természet fa virág fű levél föld '
                                        'környezet hőmérséklet fok vihar köd jég napos felhős nedves '
                                        'száraz'),
    ('animals', 'állat kutya macska ló tehén birka malac madár tyúk kacsa medve farkas róka nyúl '
                'egér kígyó rovar méh légy'),
    ('health and the body', 'test arc haj nyak váll kar ujj térd hát szív vér csont bőr egészség '
                            'betegség megfázás köhögés influenza seb allergia tabletta recept rendelés '
                            'fogorvos mentő egészséges fáradt köhög megsérül'),
    ('feelings and character', 'öröm szomorúság félelem harag szerelem szeretet remény meglepetés '
                               'szomorú dühös ideges nyugodt vidám félénk bátor lusta szorgalmas okos '
                               'buta udvarias őszinte türelmes féltékeny büszke unatkozik fél:verb'),
    ('free time and sport', 'szabadidő hobbi sport foci futball tenisz kosárlabda úszás meccs csapat '
                            'játékos labda koncert zene dal film előadás kiállítás fénykép fotó játék '
                            'buli parti meghívás ajándék születésnap ünnep karácsony húsvét esküvő '
                            'táncol énekel úszik fut fest rajzol meghív ünnepel szórakozik'),
    ('time and sequence', 'múlt jövő jelen század évtized dátum naptár tegnapelőtt holnapután hamar '
                          'nemrég azonnal egyszer közben végre általában ritkán naponta hetente '
                          'havonta évente hétvége hét:noun'),
    ('numbers and quantity', 'hatvan hetven nyolcvan kilencven tizenkettő tizenöt millió milliárd '
                             'negyed dupla kiló gramm liter méter kilométer centiméter '
                             'darab üveg doboz pár szám csoport'),
    ('everyday verbs', 'felmegy lemegy bemegy kimegy átmegy elindul '
                       'megáll vezet parkol elveszít nyer kölcsönad elküld kap felhív válaszol '
                       'elmagyaráz ismétel fordít választ dönt megígér elfelejt felejt '
                       'álmodik születik köszön üdvözöl megismer mutat megmutat oszt cserél '
                       'megjavít épít elront megtart elrejt dob eldob készít rendel kiszolgál '
                       'pihen sétál siet késik nevet sír vásárol'),
]

B1 = [
    ('work and the economy', 'állás munkanélküli munkanélküliség pályázat önéletrajz interjú tapasztalat '
                             'képzettség szakma vállalat vállalkozás üzletember tulajdonos részleg '
                             'értekezlet megbeszélés határidő túlóra bér adó számla költség kiadás '
                             'bevétel nyereség veszteség hitel kölcsön kamat bankkártya készpénz '
                             'befektet spórol keres:verb alkalmaz felmond kirúg nyugdíj gazdaság '
                             'piac:noun termék szolgáltatás vevő ügyintézés'),
    ('education', 'oktatás tanulmány tantárgy tanterv tanítás tanuló hallgató professzor előadó '
                  'osztályzat bizonyítvány érettségi felvételi ösztöndíj kollégium szemeszter '
                  'félév szünet dolgozat esszé kutatás tudomány ismeret tudás matematika történelem '
                  'irodalom földrajz fizika kémia biológia nyelvtan tanít felkészül megbukik '
                  'átmegy:verb jelentkezik'),
    ('the news, media and technology', 'újság napilap folyóirat magazin cikk riport riporter '
                                       'újságíró szerkesztő tévé televízió rádió műsor adás csatorna '
                                       'reklám hirdetés internet honlap weboldal számítógép laptop '
                                       'képernyő billentyűzet program alkalmazás jelszó fiók fájl '
                                       'adat letölt feltölt nyomtat keres:verb mobil '
                                       'okostelefon üzen kommentár közösségi'),
    ('government, law and society', 'kormány állam ország:noun politika politikus párt választás '
                                    'szavaz miniszter miniszterelnök parlament képviselő polgármester '
                                    'törvény jog szabály bíróság ügyész tanú bűn bűnöző lopás tolvaj '
                                    'büntetés bírság rendőrség tüntetés sztrájk jog:noun társadalom '
                                    'polgár lakosság népesség kisebbség szegénység gazdag hagyomány '
                                    'szokás kultúra vallás'),
    ('the environment and the weather', 'környezetvédelem szennyezés éghajlat klíma felmelegedés '
                                        'természetvédelem szemét hulladék újrahasznosítás energia '
                                        'áram erőforrás víz:noun árvíz aszály földrengés '
                                        'katasztrófa vihar villám mennydörgés zivatar szivárvány '
                                        'páratartalom előrejelzés fagy olvad'),
    ('health and medicine', 'tünet fájdalom kezelés műtét operáció vizsgálat diagnózis '
                            'beteg:noun páciens injekció oltás vérnyomás láz:noun hasmenés '
                            'fertőzés vírus baktérium sérülés törés égés stressz depresszió '
                            'egészségügy biztosítás táplálkozás diéta vitamin kalória '
                            'edz gyógyít kezel megvizsgál hány fogy hízik'),
    ('travel and transport', 'közlekedés forgalom autópálya autóbusz kamion jogosítvány benzin '
                             'baleset:noun sebesség gyalogos utas jegypénztár csatlakozás '
                             'felszáll leszáll beszáll poggyász szállás:noun kemping panzió '
                             'látnivaló műemlék kilátás külföld útvonal irány '
                             'térkép:noun navigáció bérel'),
    ('the household and chores', 'háztartás mosogat vasal porszívó felmos '
                                 'kitakarít bevásárol mosogatógép mosópor vasaló rezsi '
                                 'albérlet bérlő szerelő vízvezeték fűtés villany '
                                 'konnektor elem javítás felújítás berendez'),
    ('relationships and the stages of life', 'kapcsolat:noun házasság házaspár pár:noun '
                                             'szerelmes udvarol randevú randi megnősül férjhez_megy '
                                             'elválik terhes terhesség születés '
                                             'gyermekkor ifjúság felnőtt öregség halál:noun '
                                             'temetés özvegy árva örökbe_fogad barátság ismerős '
                                             'veszekszik bízik csalódik'),
    ('feelings and character', 'érzelem hangulat boldogság elégedett csalódott aggódás aggodalom '
                               'szégyen szégyell bűntudat irigy magányos izgatott '
                               'kíváncsi lelkes hálás megkönnyebbül meglepődik csodál tisztel '
                               'utál:verb gyűlöl jellem személyiség becsületes megbízható felelős '
                               'önző kedves:adj szerény makacs komoly:adj humor'),
    ('religion and festivals', 'vallás hit hisz:verb isten imádkozik ima egyház pap keresztény '
                               'katolikus református zsidó muszlim mise szilveszter újév '
                               'névnap évforduló ünnepség hagyományos szentelt böjt'),
    ('ideas, reasons and plans', 'ok cél:noun szándék elképzelés gondolat vélemény nézet érv '
                                 'magyarázat megoldás eredmény következmény hatás előny hátrány '
                                 'lehetőség:noun feltétel kockázat siker kudarc tapasztalat '
                                 'tény adat:noun példa különbség hasonlóság változás fejlődés '
                                 'terv:noun cél tervez:verb'),
    ('connectors', 'ezért tehát mégis azonban viszont:adv ugyanis hiszen különben ellenben '
                   'egyrészt másrészt például végül:adv először:adv aztán:adv majd:adv '
                   'mindenesetre egyébként sőt főleg főként leginkább legalább:adv kivéve '
                   'habár noha bár:conj amennyiben'),
    ('describing', 'fontos:adj érdekes:adj unalmas izgalmas hasznos haszontalan lehetetlen '
                   'kényelmes kényelmetlen népszerű híres ismert ismeretlen különböző hasonló '
                   'egyforma átlagos tipikus modern hagyományos:adj gyakori ritka egyszerű:adj '
                   'bonyolult pontos:adj megfelelő szükséges kötelező ingyenes nyilvános '
                   'személyes hivatalos'),
    ('verbs of thinking, deciding, arguing and changing', 'gondolkodik:verb mérlegel '
                                                          'eldönt elhatároz választ:verb javasol '
                                                          'ajánl tanácsol vitatkozik egyetért '
                                                          'ellenez meggyőz bizonyít tagad elismer '
                                                          'beismer állít:verb feltételez '
                                                          'összehasonlít megváltozik megváltoztat '
                                                          'fejlődik fejleszt növekszik nő:verb csökken '
                                                          'javul romlik alkalmazkodik befolyásol '
                                                          'támogat elér:verb elkerül megold '
                                                          'kezel:verb szervez megszervez'),
]

B2 = [
    ('politics and public administration', 'demokrácia diktatúra köztársaság királyság alkotmány '
                                           'kormányzat önkormányzat hivatal hatóság intézmény '
                                           'minisztérium államtitkár tisztviselő bürokrácia '
                                           'választópolgár szavazat népszavazás jelölt kampány '
                                           'ellenzék koalíció többség hatalom:noun reform '
                                           'rendelet intézkedés javaslat vita ülés tárgyal '
                                           'kinevez lemond megválaszt elnököl kormányoz '
                                           'diplomácia nagykövet nagykövetség szövetség '
                                           'szerződés:noun szuverenitás függetlenség'),
    ('the law and the courts', 'bíró ügyvéd:noun vád tanúvallomás eskü ítélet '
                               'felmentés ítél per pereskedik fellebbez '
                               'fellebbezés bizonyítás bűncselekmény gyilkosság csalás '
                               'megveszteget korrupció erőszak:noun szabadlábra '
                               'őrizet letartóztatás nyomoz kihallgat perel kártérítés '
                               'jogsértés törvényes törvénytelen jogi illegális legális '
                               'büntetőjog polgári'),
    ('the economy and finance', 'pénzügy költségvetés hiány infláció recesszió válság '
                                'növekedés fogyasztás fogyasztó kereslet kínálat verseny:noun '
                                'versenytárs export import kereskedelem beruházás befektetés '
                                'befektető részvény tőzsde valuta árfolyam adósság '
                                'tartozás jövedelem vagyon tőke bankszámla átutalás '
                                'kölcsönöz törleszt adózik finanszíroz kizsákmányol monopólium '
                                'privatizáció állami magán gazdasági pénzügyi'),
    ('science and research', 'tudós kutató kísérlet:noun elmélet hipotézis módszer:noun elemzés '
                             'mérés megfigyelés felfedezés:noun találmány feltaláló '
                             'laboratórium minta:noun eredmény:noun következtetés '
                             'bizonyíték:noun statisztika arány százalék átlag mennyiség '
                             'minőség jelenség folyamat szerkezet anyag:noun molekula atom '
                             'sejt:noun gén evolúció faj genetikai tudományos kísérletezik '
                             'elemez mér megfigyel felfedez feltalál kiszámít'),
    ('technology', 'technológia technika szoftver hardver adatbázis hálózat szerver felhő:noun '
                   'algoritmus programozás programozó mesterséges intelligencia robot '
                   'automatizálás digitális elektronikus műhold eszköz:noun '
                   'készülék berendezés találmány felhasználó adatvédelem '
                   'frissít telepít töröl bejelentkezik kijelentkezik titkosít'),
    ('the environment and natural resources', 'ökológia ökoszisztéma kihal '
                                              'üvegházhatás szén-dioxid kibocsátás '
                                              'fosszilis szén kőolaj földgáz atomenergia '
                                              'megújuló fenntartható fenntarthatóság '
                                              'ivóvíz talaj nyersanyag ásvány bánya '
                                              'esőerdő sivatag óceán gleccser '
                                              'szennyez kimerül megőriz védett'),
    ('health and the mind', 'lélektan pszichológia pszichológus pszichiáter terápia elme tudat '
                            'tudatalatti szorongás pánik függőség alkoholizmus '
                            'magány önbizalom alvászavar étvágy '
                            'fogyatékosság krónikus fertőző járvány világjárvány immunitás '
                            'védőoltás antibiotikum mellékhatás megelőzés '
                            'rehabilitáció ápol megelőz felépül'),
    ('the arts, literature and the media', 'művészet művész festmény festő szobor szobrász '
                                           'galéria tárlat zeneszerző karmester zenekar opera '
                                           'balett színész színésznő rendező forgatókönyv '
                                           'jelenet főszereplő regény regényíró költő költészet '
                                           'vers novella mese kiadó fejezet szereplő cselekmény '
                                           'stílus kritika kritikus sajtó média tudósító '
                                           'interjú:noun dokumentumfilm sorozat közönség '
                                           'néző olvasó ábrázol alkot'),
    ('history and society', 'történész korszak középkor reneszánsz forradalom felkelés '
                            'birodalom gyarmat rabszolga háború:noun megszállás '
                            'ostrom nemzet nemzetiség haza hazafi örökség emlékmű régész '
                            'társadalmi osztály:noun középosztály munkásosztály '
                            'egyenlőség egyenlőtlenség diszkrimináció rasszizmus előítélet '
                            'bevándorló bevándorlás menekült integráció globalizáció'),
    ('argument and evaluation', 'állítás érvelés ellenérv bizonyíték:noun forrás:noun tény:noun '
                                'ok:noun összefüggés ellentmondás feltevés szempont '
                                'álláspont kritérium értékelés szemlélet tévhit kétség:noun '
                                'meggyőződés kompromisszum alternatíva megfontol '
                                'érvényes meggyőző ellentmondásos objektív '
                                'szubjektív valószínű kétséges vitatott elfogadható'),
    ('formal connectors', 'továbbá ezenkívül emellett mindazonáltal '
                          'ugyanakkor következésképpen eszerint tudniillik illetve '
                          'valamint azaz ellenkezőleg amennyiben:conj '
                          'feltéve egyébként:adv elsősorban '
                          'nevezetesen'),
    ('describing', 'jelentős lényeges alapvető átfogó részletes pontatlan világos:adj '
                   'homályos összetett egyértelmű kétértelmű hatékony eredményes '
                   'hatástalan fenntartható:adj megbízhatatlan elegendő elégtelen '
                   'számottevő csekély rendkívüli kivételes általános:adj konkrét '
                   'elvont gyakorlati elméleti tartós ideiglenes állandó fokozatos '
                   'hirtelen:adj'),
    ('verbs of reporting, analysing and persuading', 'kijelent bejelent közöl tájékoztat '
                                                     'nyilatkozik hangsúlyoz kiemel '
                                                     'megjegyez rámutat cáfol megerősít '
                                                     'elemez:verb értelmez megvitat '
                                                     'érvel indokol kifejt összefoglal '
                                                     'meghatároz megállapít becsül '
                                                     'meggyőz:verb rábeszél '
                                                     'befolyásol:verb kritizál bírál '
                                                     'helyesel követel '
                                                     'tiltakozik ellenáll előidéz '
                                                     'eredményez hozzájárul'),
]

C1 = [
    ('philosophy and ethics', 'filozófia filozófus erkölcs erkölcsi etika erény bűn:noun '
                              'lelkiismeret létezés lényeg:noun igazság:noun '
                              'valóság:noun látszat tudat:noun tapasztalat:noun értelem:noun ész:noun '
                              'logika logikus paradoxon kétely eszme eszmény ideál '
                              'világnézet értékrend méltóság becsület tisztesség felelősség:noun '
                              'igazságosság önzetlen elv elvi'),
    ('religion and the inner life', 'hívő vallásos istenség teremtő teremtés '
                                    'üdvösség megváltás túlvilág halhatatlan '
                                    'lélek:noun szellemi spirituális elmélkedés '
                                    'meditáció böjtöl gyón bűnbánat kegyelem:noun '
                                    'szentség szertartás:noun zarándok zarándoklat kolostor '
                                    'szerzetes apáca püspök érsek prédikáció próféta '
                                    'jóslat babona'),
    ('scholarly Hungarian', 'tanulmány:noun disszertáció szakirodalom '
                            'idézet hivatkozás lábjegyzet bibliográfia kézirat '
                            'kivonat fogalom:noun meghatározás definíció kategória '
                            'rendszerez módszertan elemzés:noun szintézis '
                            'érvelés:noun bizonyítás:noun cáfolat feltevés:noun '
                            'következtetés:noun általánosít értelmezés '
                            'kutatási tudományos:adj empirikus elméleti:adj kísérleti '
                            'szakmai szakértelem'),
    ('government, diplomacy and the constitution', ' alkotmányos alkotmánybíróság '
                                                   'törvényhozás végrehajtó '
                                                   'parlamenti országgyűlés szenátus '
                                                   'képviselőház mandátum ciklus kormányfő '
                                                   'államfő uralkodó trón trónörökös '
                                                   'monarchia abszolutizmus totalitárius '
                                                   'diplomata külügy külpolitika '
                                                   'tárgyalás:noun egyezmény '
                                                   'szerződő megállapodás:noun szankció '
                                                   'embargó ultimátum fegyverszünet '
                                                   'békeszerződés nemzetközi:adj '
                                                   'hatályos érvénytelen'),
    ('the economy and development', 'fejlett fejletlen fejlődő infrastruktúra iparosodás ipar '
                                    'mezőgazdaság gazdálkodás termelés termelékenység hatékonyság '
                                    'versenyképes versenyképesség munkaerő munkaerőpiac '
                                    'foglalkoztatás jólét '
                                    'egyenlőtlenség:noun támogatás:noun '
                                    'segély adókedvezmény hitelező adós csőd '
                                    'kötvény osztalék árfolyam:noun deviza '
                                    'vállalkozó nyereséges veszteséges'),
    ('medicine and the body', 'orvostudomány anatómia élettan szervezet:noun idegrendszer '
                              'keringés vérkeringés emésztés légzés anyagcsere hormon '
                              'immunrendszer daganat rákos tüdő máj vese gyomor:noun bél agy:noun '
                              'gerinc izom ideg:noun ér:noun vérrög stroke szívbetegség '
                              'cukorbetegség kór kórház:noun '
                              'diagnosztizál kezelőorvos szakorvos sebészet '
                              'gyógyulás lábadozik'),
    ('law and rights', ' jogállam jogszabály rendelkezés jogosult jogosultság '
                       'kötelezettség szólásszabadság sajtószabadság egyenjogúság '
                       'állampolgár állampolgárság menedékjog ártatlanság '
                       'vélelem bizonyíték:noun tanúvallomás:noun ítélet:noun kegyelem '
                       'jogász közjegyző végrehajt végrehajtás '
                       'szabálysértés'),
    ('language and literature', 'nyelvészet nyelvész anyanyelv idegen_nyelv nyelvjárás tájszólás '
                                'szókincs kiejtés hangsúly:noun helyesírás nyelvtani '
                                'jelentéstan szófaj ige főnév melléknév határozószó névmás '
                                'névutó toldalék rag képző jel:noun irodalmi próza költemény '
                                'líra dráma:noun elbeszélés elbeszélő hős:noun metafora '
                                'hasonlat jelkép szimbólum irónia paródia műfaj '
                                'mű:noun alkotás remekmű'),
    ('the shades of feeling and judgement', 'elragadtatás sóvárog vágyakozik nosztalgia '
                                            'búskomor kedvetlen '
                                            'kétségbeesett kétségbeesés '
                                            'lenéz undor '
                                            'felháborító '
                                            'harag:noun düh:noun irigység féltékenység '
                                            'rokonszenv ellenszenv együttérzés megértés '
                                            'csodálat tisztelet:noun hála:noun elismerés '
                                            'gúny gúnyos kaján'),
    ('abstract nouns of formal prose', 'jelentőség fontosság sajátosság tulajdonság jellegzetesség '
                                       'bonyolultság sokféleség '
                                       'egység:noun egységesség folytonosság változatosság '
                                       'átláthatóság hitelesség megbízhatóság szükségesség '
                                       'lehetőség:noun képesség:noun hajlam törekvés igyekezet '
                                       'szándék:noun indíték:noun körülmény:noun tényező '
                                       'szempont:noun vonatkozás összefüggés:noun '
                                       'ellentét ellentmondás:noun egyensúly '
                                       'mérték:noun határ:noun korlát kivétel'),
    ('adjectives of formal prose', 'alapos megalapozott megalapozatlan nyilvánvaló:adj '
                                   'kézenfekvő vitathatatlan kétségtelen feltűnő szembetűnő '
                                   'számottevő:adj elenyésző jelentéktelen irányadó '
                                   'meghatározó döntő sorsdöntő végleges átmeneti kölcsönös '
                                   'egyoldalú sokoldalú átfogó:adj hiánytalan '
                                   'hiányos következetes indokolatlan '
                                   'jogos jogtalan időszerű elavult korszerű'),
    ('literary connectors and adverbs', 'mindazonáltal ámde ellenben:conj jóllehet holott '
                                        'minthogy:conj mivelhogy miszerint '
                                        'tekintve netán netalán ugyancsak '
                                        'hasonlóképpen egyidejűleg utólag előzetesen '
                                        'kizárólag kifejezetten kiváltképp elsősorban:adv '
                                        'viszonylag aránylag lényegében tulajdonképpen:adv '
                                        'nyilvánvalóan:adv mindenekelőtt végezetül'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
