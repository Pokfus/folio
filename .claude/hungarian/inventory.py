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

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1}
