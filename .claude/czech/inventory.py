"""The hand-written inventory of each ASSEMBLED level's topics -- Folio's own list.

WHY IT IS HAND-WRITTEN.  A1 and A2 come from the exam board's own list (`soupis.py`).  Beyond A2 no Czech
exam board publishes one: NPI ČR's citizenship exam (B1) publishes a candidates' manual and a civics glossary,
not a word list, and Charles University's CCE exams publish descriptions (checked 2026-11-16, see
`docs/czech-decks-plan.md` §2).  So, as for Polish, each level's CORE is written here, a topic at a time, and
`select.py` tops it up with the commonest remaining words.

B1's TOPICS are the fourteen themes of the Council of Europe's *Threshold Level* (J. A. van Ek and J. L. M.
Trim, 1990), the specification the CEFR's B1 descends from: personal identification; house and home, and the
environment; daily life; free time and entertainment; travel; relations with other people; health and body
care; education; shopping; food and drink; services; places; language; weather -- plus the words of opinion and
argument the level's functions need.  Most of each theme's everyday words are already in A1 and A2, which
`select.py` skips; what is written here is the next layer.

`select.py` resolves every word against Wiktionary (a word not found there is reported and dropped -- never
given a meaning here).  A reflexive verb is written with its clitic (`stěžovat si`), as the official list does.
"""

B1 = [
    ("personal identification", "původ narodit dospělost mládí stáří věk povolání vzdělání státní_příslušnost "
                                "náboženství víra vyznání podpis totožnost rodný muž žena svobodný ženatý "
                                "rozvedený vdovec vdova manželství sňatek svatba"),
    ("character and feelings", "povaha vlastnost osobnost chování nálada pocit cit emoce štěstí smutek strach "
                               "obava úzkost radost hněv vztek žárlivost závist hrdost stud lítost naděje "
                               "zklamání překvapení nadšení nuda klid trpělivost trpělivý netrpělivý upřímný "
                               "poctivý líný pracovitý ctižádostivý sobecký štědrý skromný laskavý přátelský "
                               "zdvořilý nezdvořilý drzý stydlivý odvážný zbabělý spolehlivý citlivý vtipný "
                               "rozumný hloupý chytrý moudrý zvědavý tvrdohlavý"),
    ("house, home and the environment", "bydlení domov stavba podkroví sklep půda střecha komín zeď plot "
                                        "schodiště chodba předsíň zařízení vybavení nábytek polštář deka "
                                        "prostěradlo povlečení koberec závěs záclona zásuvka vypínač kohoutek "
                                        "topení radiátor nájem nájemník majitel pronajímatel stěhování stěhovat "
                                        "opravit oprava údržba úklid uklidit vysávat zalévat životní_prostředí "
                                        "příroda krajina znečištění odpad recyklace třídit klima ovzduší "
                                        "ochrana chránit zvíře rostlina energie elektřina spotřeba šetřit"),
    ("daily life", "zvyk návyk denní režim povinnost domácnost nákup vaření praní žehlení mytí nádobí "
                   "vstávat usínat probudit budík spěchat zpoždění zpozdit stihnout dojíždět dojíždění "
                   "zaměstnání směna přesčas plat mzda výplata důchod brigáda"),
    ("free time and entertainment", "zábava zájem koníček záliba volno odpočinek relaxace výstava galerie "
                                    "umění obraz socha malíř malba hudba skladatel zpěvák kapela písnička "
                                    "koncert divadlo hra představení herec role režisér film seriál pořad "
                                    "zprávy noviny časopis článek kniha román povídka báseň spisovatel "
                                    "čtenář sport soutěž zápas závod hráč tým trenér vítěz porážka "
                                    "remíza turnaj mistrovství fanoušek fandit cvičení posilovna turistika "
                                    "výlet procházka rybařit sbírat sbírka fotografie fotit"),
    ("travel", "cestování cesta cestovat dovolená prázdniny zájezd ubytování rezervace rezervovat penzion "
               "kemp stan pas vízum hranice celnice clo zavazadlo kufr batoh letiště let odlet přílet "
               "přestup přestupovat spoj spojení jízdenka jízdné nástupiště zpáteční průvodce památka "
               "pamětihodnost suvenýr turista cizina zahraničí mapa směr navigace"),
    ("relations with other people", "vztah přátelství láska rande schůzka seznámit setkání návštěva host "
                                    "pozvání pozvat oslava narozeniny svátek výročí dárek blahopřání "
                                    "gratulovat soused kolega známý partner partnerka manžel manželka "
                                    "rodiče sourozenec příbuzný hádka hádat usmířit omluva omluvit "
                                    "důvěra důvěřovat pomoc podpora rada radit spolupráce domluvit dohoda "
                                    "slib slíbit pozdravit rozloučit společnost generace"),
    ("health and body care", "zdraví nemoc onemocnět nachladit nachlazení chřipka kašel horečka bolest "
                             "zranění úraz zlomenina rána krvácet otok alergie infekce vir lék tableta "
                             "předpis recept lékárna ordinace pohotovost sanitka nemocnice operace "
                             "vyšetření vyšetřit ošetřit léčba léčit uzdravit pacient sestra lékař "
                             "zubař pojištění pojišťovna hygiena kosmetika strava dieta hubnout "
                             "přibrat cvičit kondice stres únava odpočinout spánek kouřit"),
    ("education", "vzdělání škola školka gymnázium univerzita vysoká_škola fakulta obor studium studovat "
                  "student učitel profesor přednáška seminář kurz lekce výuka předmět rozvrh "
                  "zkouška test známka vysvědčení diplom maturita přijímačky přihláška zapsat "
                  "úkol domácí_úkol cvičení učebnice sešit slovník knihovna znalost dovednost "
                  "naučit vysvětlit pochopit opakovat zapomenout"),
    ("shopping", "obchod prodejna nákupní_centrum supermarket trh tržnice zboží výrobek značka kvalita "
                 "cena sleva výprodej akce nabídka poptávka účtenka pokladna platba platit hotovost "
                 "karta reklamace reklamovat vrátit vyměnit záruka velikost zkusit kabinka "
                 "objednat objednávka doručit doručení zásilka balík"),
    ("food and drink", "jídlo strava potravina surovina recept přísada vařit péct smažit dusit grilovat "
                       "krájet míchat ochutnat chuť chutnat chutný sladký slaný kyselý hořký pálivý "
                       "čerstvý zdravý vegetarián maso zelenina ovoce mléčný výrobek pečivo moučník "
                       "dezert předkrm polévka hlavní_jídlo příloha omáčka nápoj alkohol nealkoholický "
                       "restaurace jídelní_lístek objednat spropitné účet"),
    ("services", "služba úřad pošta banka účet převod půjčka úvěr hypotéka úrok poplatek pojištění "
                 "formulář žádost žádat vyřídit potvrzení doklad průkaz občanský_průkaz policie "
                 "hasiči záchranka oprava opravna servis čistírna kadeřnictví telefon mobil "
                 "internet připojení e-mail heslo účet aplikace"),
    ("places", "město vesnice obec venkov předměstí čtvrť centrum náměstí ulice silnice dálnice most "
               "nádraží letiště přístav okres kraj region stát země hlavní_město hora kopec údolí "
               "řeka jezero rybník les pole louka pobřeží ostrov poušť"),
    ("language", "jazyk mateřský_jazyk cizí_jazyk slovo věta význam výslovnost vyslovit pravopis "
                 "gramatika chyba opravit překlad přeložit tlumočit rozumět porozumět mluvit "
                 "konverzace rozhovor diskuse dialekt přízvuk plynně"),
    ("weather", "počasí předpověď podnebí teplota stupeň slunce slunečno zataženo oblačno mrak "
                "déšť pršet bouřka blesk hrom vítr foukat sníh sněžit mráz led mlha vlhko "
                "sucho horko vedro zima povodeň"),
    ("opinion and argument", "názor myslet domnívat_se považovat souhlasit nesouhlasit tvrdit argument "
                             "důvod příčina následek výhoda nevýhoda problém řešení řešit možnost "
                             "rozhodnout rozhodnutí doporučit návrh navrhnout kritizovat kritika "
                             "pochybovat jistota nejistota pravděpodobně zřejmě určitě samozřejmě "
                             "naopak přesto však ovšem tedy proto protože jelikož pokud ačkoli "
                             "zatímco kromě navíc dokonce například zkrátka nakonec především"),
]

# B2's TOPICS: the Council of Europe's B2 specification, *Vantage* (J. A. van Ek and J. L. M. Trim, 2001), carries
# the Threshold Level's themes a level further -- from the speaker's own life to the society around it.  The
# inventory takes them into work and the economy, the state, law and politics, the media and technology, science,
# health care, the environment, culture and the arts, education, relationships, and the language of discussion
# and formal writing.  Words already taught at A1-B1 are skipped by `select.py`.
B2 = [
    ("work and careers", "kariéra profese zaměstnanec zaměstnavatel pracovník vedení vedoucí manažer ředitel "
                         "odborník specialista kvalifikace praxe zkušenost životopis pohovor uchazeč nabídka "
                         "pracovní_smlouva výpověď propustit propouštění nezaměstnanost podnikání podnikatel "
                         "živnost samostatný odbory stávka mzda příjem odměna prémie benefit povýšení "
                         "pracovní_doba úvazek kolektiv porada jednání projekt termín úkol zodpovědnost "
                         "pravomoc kompetence výkon produktivita"),
    ("the economy and money", "ekonomika hospodářství trh poptávka nabídka konkurence firma podnik společnost "
                              "akcie akciový burza investice investovat investor zisk ztráta obrat rozpočet "
                              "náklady výdaj příjmy daň daňový inflace deflace krize recese růst pokles "
                              "úvěr dluh zadlužit splátka úrok banka spoření úspory pojištění dotace "
                              "export import obchod obchodní cla měna kurz hodnota cenový zdražit zlevnit "
                              "spotřebitel výroba průmysl zemědělství služby"),
    ("the state, politics and society", "stát vláda parlament sněmovna senát poslanec senátor ministr "
                                        "premiér prezident volby volit volič kandidát kampaň strana "
                                        "opozice koalice demokracie diktatura režim ústava zákon právo "
                                        "svoboda občan občanský společnost obyvatelstvo menšina většina "
                                        "přistěhovalec uprchlík migrace integrace diskriminace rovnost "
                                        "nerovnost chudoba bohatství sociální dávka důchod reforma "
                                        "politika politický politik veřejný úřad úředník byrokracie "
                                        "korupce protest demonstrace referendum hlasování mezinárodní "
                                        "zahraniční vztahy diplomacie velvyslanectví válka mír konflikt "
                                        "armáda obrana bezpečnost terorismus"),
    ("law and crime", "právo zákon soud soudce soudní advokát právník obžaloba žaloba žalovat obvinit "
                      "obviněný obžalovaný svědek svědectví důkaz vyšetřování vyšetřovat policie "
                      "zločin trestný_čin pachatel oběť krádež loupež podvod vražda násilí vězení "
                      "trest pokuta rozsudek odsoudit osvobodit odvolání spravedlnost nespravedlnost "
                      "porušit dodržovat povinnost práva lidská_práva"),
    ("the media and technology", "média tisk zpravodajství novinář redakce redaktor reportáž rozhovor "
                                 "článek zpráva vysílání vysílat rozhlas televize stanice "
                                 "internet web stránka sociální_sítě příspěvek sdílet komentář "
                                 "informace dezinformace cenzura reklama propagace kampaň technologie "
                                 "technika přístroj zařízení počítač software program aplikace data "
                                 "databáze síť připojení heslo zabezpečení soukromí digitální "
                                 "elektronický stáhnout nahrát vyhledat"),
    ("science and research", "věda vědec vědecký výzkum výzkumník pokus experiment teorie hypotéza "
                             "důkaz objev objevit vynález vynálezce metoda analýza výsledek závěr "
                             "měření laboratoř přírodní_vědy fyzika chemie biologie matematika "
                             "medicína genetika vesmír planeta přírodní jev proces vývoj evoluce"),
    ("health and health care", "zdravotnictví zdravotní péče pojišťovna prevence očkování vakcína "
                               "diagnóza příznak léčba terapie chronický akutní nemocný postižení "
                               "invalidita rehabilitace chirurg chirurgie operace transplantace "
                               "psychický duševní deprese úzkost závislost drogy alkoholismus kouření "
                               "výživa obezita životní_styl pohyb stres vyčerpání"),
    ("the environment", "životní_prostředí ekologie ekologický příroda klima klimatický oteplování "
                        "skleníkový emise znečištění znečistit odpad skládka recyklovat obnovitelný "
                        "zdroj energie elektrárna jaderný uhlí ropa plyn sluneční větrný úspora "
                        "chránit ochrana druh vyhynout vymírání deštný_prales sucho povodeň katastrofa "
                        "zemětřesení požár udržitelný"),
    ("culture and the arts", "kultura kulturní umění umělec umělecký dílo literatura spisovatel autor "
                             "román poezie básník próza divadlo inscenace premiéra hra herec "
                             "režie film kino festival výstava galerie muzeum sbírka malířství "
                             "sochařství architektura stavba památka dědictví tradice zvyk svátek "
                             "náboženství církev víra kritik recenze publikum obecenstvo talent "
                             "tvořit tvorba inspirace styl"),
    ("education", "vzdělávání vzdělaný školství základní střední vysokoškolský student studijní obor "
                  "přijímací zkouška maturita bakalář magistr doktorát titul stipendium "
                  "přednášet přednášející pedagog výchova vychovávat kázeň dovednost znalosti "
                  "celoživotní kurz školení certifikát"),
    ("relationships and society", "vztah partnerský manželství rozvod svobodný nevěra důvěra respekt "
                                  "tolerance předsudek stereotyp generace dospívání dospívající "
                                  "výchova rodičovství mateřská otcovství adopce sousedský komunita "
                                  "dobrovolník charita solidarita osamělost samota"),
    ("discussion and formal writing", "názor stanovisko postoj přesvědčení argument argumentovat tvrzení "
                                      "důvod důsledek příčina souvislost vliv dopad účinek výhoda "
                                      "nevýhoda přínos riziko hrozba výzva problém otázka řešení "
                                      "zdůraznit zdůvodnit vysvětlit objasnit uvést zmínit shrnout "
                                      "porovnat srovnat rozlišit hodnotit posoudit přiznat připustit "
                                      "popřít odmítnout podpořit prosadit ovlivnit způsobit "
                                      "nicméně avšak naopak tudíž proto jelikož poněvadž ačkoli "
                                      "přestože třebaže zatímco pokud kdežto mimoto navíc rovněž "
                                      "zejména především zkrátka celkově obecně údajně skutečně "
                                      "pravděpodobně zřejmě nepochybně bezpochyby"),
]

# C1's SCOPE: the CEFR's own description of the level (Council of Europe, 2001; Companion Volume, 2020) -- a
# wide range of demanding, longer texts and their implicit meaning, and language used flexibly and effectively
# for social, academic and professional purposes, on complex subjects.  The Council's level specifications
# (Waystage, Threshold, Vantage) stop at B2, so the inventory is written for those purposes: the vocabulary of
# the professions and academic fields, abstract nouns, verbs of nuance, register and the connectives of a formal
# text.  Words already taught at A1-B2 are skipped by `select.py`.
C1 = [
    ("law and administration", "legislativa legislativní zákonodárce zákonodárný vyhláška nařízení předpis "
                               "směrnice novela paragraf ustanovení smluvní strana plnění odpovědnost "
                               "náhrada škoda odškodnění vymáhat exekuce exekutor insolvence notář "
                               "ověřit plná_moc zplnomocnit správní řízení rozhodnutí odvolat lhůta "
                               "promlčení trestní občanskoprávní obhajoba obhájce žalobce žalovaný "
                               "státní_zástupce soudnictví nezávislost justice zatčení vazba podmínka "
                               "amnestie milost úřední samospráva obecní krajský"),
    ("economics and finance", "makroekonomie mikroekonomie hospodářský fiskální měnový centrální_banka "
                              "úroková_sazba likvidita kapitál kapitálový aktiva pasiva bilance účetnictví "
                              "účetní audit zdanění odvod sleva daňový_ráj schodek přebytek státní_dluh "
                              "zadluženost bankrot úpadek fúze akvizice monopol regulace deregulace "
                              "privatizace znárodnit trh_práce mzdový minimální_mzda životní_úroveň "
                              "hrubý_domácí_produkt globalizace konkurenceschopnost"),
    ("politics and international relations", "suverenita suverénní federace unie integrace rozšíření "
                                             "smlouva ratifikace ratifikovat summit vyjednávání vyjednávat "
                                             "sankce embargo spojenectví aliance neutralita okupace "
                                             "anexe nezávislost separatismus nacionalismus populismus "
                                             "extremismus radikální konzervativní liberální levice pravice "
                                             "ideologie totalitní autoritářský legitimita mandát "
                                             "zastupitelstvo hejtman starosta volební_období legislativní "
                                             "veto lobbing transparentnost"),
    ("science, medicine and technology", "výzkumný empirický teoretický experimentální vědecký_poznatek "
                                         "zkoumat zkoumání pozorování měřit ověřovat vyvrátit "
                                         "prokazatelný hypotetický proměnná vzorec rovnice statistika "
                                         "statistický pravděpodobnost molekula atom buňka organismus "
                                         "imunita protilátka epidemie pandemie nákaza infekční "
                                         "léčivo lékařství diagnostika genetický dědičnost "
                                         "umělá_inteligence algoritmus automatizace inovace inovativní "
                                         "vývojář kybernetický šifrování"),
    ("the mind and society", "psychologie psychologický vědomí podvědomí vnímání vnímat paměť myšlení "
                             "uvažování intuice motivace sebevědomí sebeúcta identita osobnost "
                             "temperament emocionální racionální iracionální chování sociologie "
                             "sociologický společenský instituce hodnota norma morálka morální etika "
                             "etický svědomí odpovědnost svoboda autonomie solidarita "
                             "vyloučení marginalizace sekularizace"),
    ("philosophy and religion", "filozofie filozof filozofický pojem koncept podstata bytí existence "
                                "realita pravda poznání rozum logika paradox dilema princip "
                                "abstraktní konkrétní subjektivní objektivní relativní absolutní "
                                "náboženský duchovní víra věřící ateismus křesťanství judaismus "
                                "islám buddhismus kněz farář farnost biskup klášter mnich "
                                "posvátný hřích spása"),
    ("history", "dějiny historik historický dějinný období epocha éra středověk novověk starověk "
                "renesance baroko osvícenství reformace husitství husita monarchie habsburský "
                "císařství šlechta šlechtic poddaný nevolnictví revoluce převrat okupace "
                "protektorát odboj kolaborace komunismus komunistický totalita normalizace "
                "disident sametová_revoluce emigrace pamětník"),
    ("literature, language and the arts", "literární beletrie prozaik dramatik básnický lyrika epika "
                                          "žánr motiv téma děj postava vypravěč metafora symbolika "
                                          "ironie satira parodie alegorie citát úryvek rukopis vydání "
                                          "nakladatelství nakladatel překladatel kritika kritický "
                                          "estetika estetický avantgarda moderna klasicismus "
                                          "romantismus realismus rétorika řečník stylistika "
                                          "spisovný hovorový nářečí slovní_zásoba frazém"),
    ("the media and public debate", "veřejné_mínění průzkum_veřejného_mínění zpravodaj publicistika "
                                    "publicista komentátor úvodník médium mediální manipulace "
                                    "propaganda objektivita nestrannost svoboda_slova zaujatost "
                                    "kontroverzní polemika diskutovat debata vyjádření prohlášení "
                                    "tisková_konference mluvčí"),
    ("verbs of nuance and register", "konstatovat podotknout poznamenat namítnout naznačit zdůraznit "
                                     "zohlednit zvážit uvážit předpokládat domnívat_se usuzovat "
                                     "vyvozovat dovodit polemizovat oponovat vyvracet potvrzovat "
                                     "zpochybnit relativizovat bagatelizovat přeceňovat podceňovat "
                                     "upřednostnit zanedbat opomenout přehlížet vymezit definovat "
                                     "formulovat interpretovat analyzovat syntetizovat aplikovat "
                                     "implementovat iniciovat koordinovat realizovat uskutečnit "
                                     "dosáhnout docílit eliminovat minimalizovat optimalizovat"),
    ("abstract nouns", "hledisko aspekt rozměr kontext rámec souvislost předpoklad východisko "
                       "kritérium měřítko ukazatel tendence trend proces průběh vývoj fenomén "
                       "jev faktor činitel podmínka okolnost důsledek implikace rozpor protiklad "
                       "shoda soulad nesoulad rovnováha nerovnováha potenciál kapacita "
                       "efektivita účinnost udržitelnost složitost komplexnost nejednoznačnost"),
    ("connectives of a formal text", "nadto rovněž taktéž jakož i nýbrž leč ba dokonce nicméně "
                                     "pakliže jestliže jelikož poněvadž neboť pročež tudíž "
                                     "tedy čili respektive popřípadě případně eventuálně "
                                     "potažmo přičemž načež ačkoli třebas byť přestože "
                                     "naproti_tomu vzhledem_k ohledně stran vůči díky "
                                     "na_rozdíl_od v_rámci za_účelem prostřednictvím "
                                     "v_důsledku nanejvýš přinejmenším obzvláště "
                                     "zpravidla převážně výhradně nanejvýš"),
]

INVENTORY = {"b1": B1, "b2": B2, "c1": C1}


def headwords(level):
    """[(headword, topic)] in the inventory's order; `_` joins a multi-word entry."""
    out = []
    for topic, words in INVENTORY.get(level, []):
        for w in words.split():
            out.append((w.replace("_", " "), topic))
    return out
