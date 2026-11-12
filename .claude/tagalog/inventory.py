#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No openly licensed graded Tagalog word list was found (see `tl_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`mahal:adj`) where the
spelling is shared and the level wants one reading first.  VERBS ARE WRITTEN AS
THE AFFIXED VERB A LEARNER SAYS (`kumain` "to eat", `mag-aral` "to study"),
never the bare root, which Wiktionary files as a noun (`kain` "act of
eating").  Multi-word entries join with `_`.  Spellings are the plain ones
ordinary writing uses (`maganda`, not `magandá`), the 2007 orthography's
(`puwede`, whose older `pwede` the subtitles still write and which counts
towards it).
"""

A1 = [
    ('pronouns', 'ako ikaw ka siya kami tayo kayo sila ko mo niya namin natin ninyo nila '
                 'akin iyo kaniya:pron atin amin inyo kanila ito iyan iyon'),
    ('markers and particles', 'ang ng sa si ni kay mga ay na:adv pa lang din rin naman nga ba po '
                              'opo oo hindi huwag talaga sana kasi daw siguro'),
    ('questions', 'ano sino saan kailan paano bakit ilan magkano alin nasaan kumusta'),
    ('places and pointing', 'dito diyan doon nandito nandiyan nandoon'),
    ('conjunctions', 'at o pero kung dahil para kaya kapag habang bago:prep pagkatapos'),
    ('having and wanting', 'may mayroon wala gusto ayaw kailangan dapat puwede alam kilala'),
    ('greetings and politeness', 'salamat paalam ingat:intj sige pasensiya patawad tuloy:intj '
                                 'magandang_umaga magandang_hapon magandang_gabi walang_anuman'),
    ('numbers', 'isa dalawa tatlo apat lima anim pito walo siyam sampu dalawampu daan libo '
                'una ikalawa kalahati numero'),
    ('time', 'oras minuto araw:noun gabi umaga tanghali hapon ngayon kahapon bukas mamaya kanina '
             'linggo buwan taon lagi minsan maaga huli:adj palagi'),
    ('days and months', 'Lunes Martes Miyerkoles Huwebes Biyernes Sabado Linggo Enero Pebrero Marso '
                        'Abril Mayo Hunyo Hulyo Agosto Setyembre Oktubre Nobyembre Disyembre'),
    ('family', 'pamilya nanay tatay ina ama magulang kapatid kuya ate anak asawa lolo lola bata '
               'lalaki babae tao kaibigan tito pinsan'),
    ('people and yourself', 'pangalan edad bansa lungsod bayan probinsiya wika Pilipino '
                            'trabaho estudyante guro doktor kapitbahay tirahan'),
    ('food and drink', 'pagkain tubig kanin bigas tinapay karne isda manok baboy itlog gulay prutas '
                       'saging mangga kape gatas asukal asin sabaw almusal tanghalian hapunan '
                       'ulam meryenda serbesa'),
    ('shopping and money', 'pera piso presyo tindahan palengke mura mahal:adj bumili magbayad sukli'),
    ('the home', 'bahay kuwarto kusina banyo pinto bintana mesa upuan kama libro telepono susi '
                 'damit sapatos'),
    ('the town and getting about', 'kalye daan kotse bus dyip tren eroplano barko tiket istasyon '
                                   'hotel ospital paaralan opisina simbahan kaliwa kanan malayo '
                                   'malapit diretso'),
    ('the body and feeling ill', 'katawan ulo mata tainga ilong bibig kamay paa tiyan ngipin buhok '
                                 'sakit masakit gamot lagnat'),
    ('weather', 'panahon ulan hangin mainit malamig bagyo'),
    ('colours', 'kulay pula asul dilaw berde itim puti'),
    ('describing', 'malaki maliit bago:adj luma maganda pangit mabuti masama masaya malungkot '
                   'mahaba maikli madali mahirap marami kaunti masarap mabait mabilis mabagal '
                   'pagod gutom uhaw busog malinis marumi bukas:adj sarado'),
    ('everyday verbs', 'kumain uminom matulog gumising pumunta dumating umalis umuwi bumalik '
                       'pumasok lumabas umupo tumayo maglakad tumakbo magtrabaho mag-aral '
                       'magbasa sumulat magsalita magtanong sumagot makinig manood makita '
                       'marinig maintindihan magluto maligo magbihis maglaro kumanta sumayaw '
                       'tumawag maghintay maghanap magbigay kumuha magdala gumawa tumulong '
                       'magsimula matapos magustuhan mahalin tumira buksan isara'),
]

INVENTORY = {'a1': A1}

# A2 (2026-11-12): the CEFR A2 descriptor's "areas of most immediate relevance"
# -- family and relatives, work, shopping and clothes, the home and the kitchen,
# the town, travel, the natural world, health, feelings, free time and school --
# plus the connectors, adverbs and quantities a learner needs to string two
# sentences together.  A word A1 teaches is skipped by `select.py`, so this list
# need not avoid them.
A2 = [
    ('relatives', 'apo biyenan manugang bayaw hipag pamangkin tiyo kamag-anak kambal '
                  'sanggol binata dalaga matanda mag-asawa nobyo nobya kasintahan ninong '
                  'ninang kasal'),
    ('work', 'magsasaka mangingisda nars pulis sundalo abogado inhinyero tindero drayber '
             'kusinero manggagawa empleyado amo sahod suweldo kompanya pabrika negosyo karpintero '
             'kalihim manunulat artista hanapbuhay pulong'),
    ('clothes and things you carry', 'kamiseta pantalon palda bestida sumbrero medyas tsinelas sinturon '
                                     'salamin payong bag bulsa dyaket relo singsing kuwintas hikaw '
                                     'pitaka sapatos'),
    ('the kitchen and cooking', 'kaldero kawali plato baso tasa kutsara tinidor kutsilyo mangkok kalan '
                                'mantika toyo suka paminta bawang sibuyas kamatis patatas mais niyog '
                                'gata harina keso mantikilya lasa matamis maasim maalat mapait '
                                'maanghang pansit adobo sinigang lumpiya litson keyk sorbetes'),
    ('fruit', 'pinya papaya bayabas mansanas ubas dalandan kalamansi pakwan buko'),
    ('the home', 'sala silid hagdan bubong sahig dingding pader hardin bakuran garahe ilaw kurtina '
                 'unan kumot aparador sopa telebisyon radyo kompyuter bentilador sabon tuwalya '
                 'sipilyo walis basura kuryente gripo'),
    ('the town', 'munisipyo barangay plasa parke museo aklatan bangko restawran karinderya botika '
                 'panaderya kanto tulay gusali paliparan sinehan pulisya kalsada'),
    ('travel and transport', 'biyahe maglakbay bakasyon pasaporte maleta bagahe mapa turista traysikel '
                             'bangka taksi motorsiklo bisikleta sumakay bumaba magmaneho trapiko '
                             'pamasahe sakayan'),
    ('the natural world', 'dagat ilog bundok bulkan isla pulo gubat dalampasigan baybayin lawa bukid '
                          'palayan puno:noun bulaklak damo dahon bato buhangin langit bituin ulap kidlat '
                          'kulog lindol baha tag-araw tag-ulan mundo lupa apoy hayop'),
    ('animals', 'aso pusa ibon kalabaw kabayo kambing daga ahas lamok langgam ipis langaw unggoy '
                'buwaya pagong kalapati hipon alimango pusit insekto paruparo gagamba palaka tandang '
                'sisiw tuta'),
    ('health and the body', 'braso binti daliri leeg balikat likod dibdib puso dugo balat mukha labi '
                            'dila tuhod siko ubo sipon trangkaso sugat klinika pahinga magpahinga '
                            'gumaling magkasakit hilo bitamina'),
    ('feelings and character', 'galit takot saya lungkot inggit selos hiya gulat tuwa pag-ibig '
                               'pag-asa masipag tamad matalino masungit mayabang mahiyain matapang '
                               'duwag tapat totoo sinungaling nerbiyos magalit matakot mag-alala '
                               'mainipin magulat'),
    ('free time and celebrations', 'laro basketbol musika kanta sayaw pelikula sine palabas programa '
                                   'laruan piyesta pista kaarawan regalo handaan binyag '
                                   'litrato larawan kamera balita dyaryo'),
    ('school', 'klase leksiyon aralin takdang-aralin pagsusulit papel lapis bolpen kuwaderno pisara '
               'mag-aaral unibersidad kolehiyo marka tanong sagot aklat diksiyonaryo '
               'matematika agham kasaysayan'),
    ('numbers and quantities', 'labing-isa labindalawa tatlumpu apatnapu limampu sandaan milyon '
                               'lahat bawat iba sobra kulang buo dosena metro kilo litro beses '
                               'pares'),
    ('time words', 'segundo madalas bihira agad kaagad noon dati susunod nakaraan '
                   'katapusan simula tuwing araw-araw gabi-gabi hatinggabi madaling-araw siglo '
                   'dekada kalendaryo'),
    ('colours', 'kahel rosas lila kayumanggi abo ginto pilak luntian'),
    ('describing', 'mataas mababa malalim mababaw malapad makitid makapal manipis mabigat magaan '
                   'matigas malambot basa:adj tuyo malinaw madilim maliwanag tahimik maingay mayaman '
                   'sariwa bulok malakas mahina payat mataba matangkad pandak guwapo kulot mahalaga '
                   'sikat:adj delikado ligtas mali tama pareho handa abala libre buhay malusog '
                   'masikip maluwag'),
    ('everyday verbs', 'magsuot maglinis maghugas bumisita dumalaw ipadala tumanggap magbenta magtinda '
                       'humiram pahiram magbago maghanda magdasal magsimba mag-usap magkuwento '
                       'tumawa umiyak ngumiti maniwala mag-isip isipin makalimutan kalimutan '
                       'matuto magturo ipaliwanag subukan pumili manalo matalo maglagay ilagay kunin '
                       'ibigay tingnan hanapin gumamit dalhin ayusin linisin hugasan lutuin bilhin '
                       'ipakita huminto magpatuloy sumunod mamili magtanim mangisda lumangoy '
                       'umakyat mahulog kumita gumastos mag-ipon palitan sumama '
                       'maglaba pasyal magpakasal mabuhay mamatay lumaki '
                       'magtapos'),
    ('connectors and adverbs', 'saka tapos samantala kahit bagaman sapagkat upang maliban kasama tungkol '
                               'mula hanggang papunta galing laban ayon gaya katulad halos medyo '
                               'masyado bigla dahan-dahan mag-isa sabay muli ulit lamang lalo '
                               'pati marahil tiyak sigurado yata pala mismo ganito ganyan ganoon kanino '
                               'gaano'),
]

INVENTORY['a2'] = A2

# B1 (2026-11-12): the CEFR B1 descriptor's "familiar matters regularly
# encountered in work, school, leisure" plus "experiences and events, dreams,
# hopes and ambitions" and giving "reasons and explanations for opinions and
# plans" -- so work and money, study, health, the media, society and the law,
# nature and the environment, belief and culture, and the verbs and connectors of
# opinion, reason and narrative.  Words A1 and A2 teach are skipped by `select.py`.
#
# MANY B1 VERBS ARE NOT IN WIKTIONARY under their affixed spelling (`magplano`,
# `magpasya`, `iwasan`, `tanggihan`, `magpasalamat` ... about sixty of the first
# draft), so this level leans on nouns; where Wiktionary files another affix of
# the same root it is written instead (`umiwas`, `itanggi`, `isali`,
# `magpaopera`, `maglarawan`), and the rest were dropped, never guessed.
B1 = [
    ('work and career', 'karera propesyon posisyon aplikasyon panayam karanasan '
                        'kasamahan pinuno tagapamahala direktor kawani ahensiya serbisyo produkto '
                        'kostumer kliyente kita gastos puhunan buwis kontrata pulong '
                        'mamuhunan'),
    ('money and banking', 'bangko deposito interes resibo kuwenta badyet ipon presyo singil '
                          'barya salapi tseke kard halaga mamahalin bayarin utang '
                          'humiram magpautang magtipid'),
    ('study and knowledge', 'edukasyon kurso asignatura propesor estudyante pag-aaral '
                            'kaalaman karunungan aral impormasyon datos sanaysay ulat paksa pahina '
                            'kabanata talata salita iskolarsip '
                            'magsaliksik mag-aral bumagsak'),
    ('health and medicine', 'kalusugan sakit sintomas impeksiyon alerdyi presyon '
                            'diyabetes kanser operasyon pasyente siruhano dentista parmasya reseta '
                            'gamot iniksiyon bakuna ehersisyo diyeta timbang '
                            'mag-ehersisyo gamutin magpaopera huminga '
                            'magpapayat tumaba'),
    ('the media and technology', 'balita pahayagan magasin artikulo mamamahayag '
                                 'patalastas brodkast estasyon programa teknolohiya aplikasyon '
                                 'mensahe password selpon baterya kable '
                                 'makina siyentipiko eksperimento'),
    ('society and politics', 'lipunan pamahalaan gobyerno bansa mamamayan pangulo senador '
                             'kongreso eleksiyon halalan botante bumoto partido kandidato batas '
                             'karapatan kalayaan demokrasya rebolusyon digmaan kapayapaan hukbo '
                             'protesta organisasyon komunidad kultura tradisyon '
                             'kahirapan kayamanan problema solusyon isyu patakaran'),
    ('crime and the law', 'krimen magnanakaw pulis korte hukom abogado kaso:noun ebidensiya '
                          'saksi bilanggo kulungan multa parusa hustisya inosente '
                          'magnakaw pumatay magsumbong'),
    ('nature and the environment', 'kalikasan polusyon basura klima temperatura tagtuyot '
                                   'kagubatan karagatan bukal talon kuweba lambak '
                                   'hayop halaman puno ugat sanga binhi ani pananim enerhiya '
                                   'kuryente gasolina usok hangin alikabok '
                                   'magtapon protektahan sirain'),
    ('belief and culture', 'relihiyon diyos simbahan pari madre dasal panalangin kaluluwa '
                           'pananampalataya paniniwala anghel diyablo langit impiyerno kasalanan '
                           'sining musika pintor iskultor tula makata nobela awit konsiyerto '
                           'pagdiriwang selebrasyon alamat kuwento'),
    ('travel and places', 'destinasyon reserbasyon pasahero bagahe hangganan kontinente '
                          'rehiyon lalawigan kabisera nayon siyudad lungsod bayan '
                          'tanawin dalampasigan embahada bisa'),
    ('people and relationships', 'relasyon pagkakaibigan kapitbahay kakilala bisita panauhin '
                                 'kasal diborsiyo hiwalay biyudo biyuda ulila henerasyon '
                                 'kabataan mag-anak angkan '
                                 'lahi tiwala respeto galang'),
    ('feelings and the mind', 'damdamin emosyon pakiramdam alaala isip ideya opinyon pananaw '
                              'desisyon pasya layunin pangarap ambisyon pag-asa takot kaba '
                              'kalungkutan kasiyahan kaligayahan galit inis pagod '
                              'lungkot pagmamahal pagkabigo pagsisisi'),
    ('opinion, reason and speech', 'sang-ayon tutol tama mali posible imposible malamang '
                                   'siguro talaga totoo dahilan resulta epekto sanhi paliwanag '
                                   'katwiran argumento mungkahi payo reklamo paumanhin '
                                   'sumang-ayon magpayo magreklamo humingi '
                                   'ipaliwanag patunayan ipagtanggol talakayan '
                                   'banggitin maglarawan'),
    ('describing (abstract)', 'mahalaga importante kailangan karaniwan pambihira kakaiba '
                              'kilala tanyag moderno tradisyonal makabago luma sinauna pribado '
                              'pampubliko pangkalahatan personal opisyal ilegal legal '
                              'seryoso simple kumplikado malaya ligtas mapanganib '
                              'matagumpay bigo masuwerte malas tapat matapat responsable '
                              'maayos magulo patas makatarungan'),
    ('verbs of doing and change', 'maghanda magtatag bumuo lumikha '
                                  'pumili magbago umunlad '
                                  'bumaba lumawak '
                                  'tulungan suportahan isali '
                                  'makibahagi magdiwang '
                                  'umiwas harapin mabigo magtagumpay subukan '
                                  'abutin itanggi'),
    ('verbs of the mind and talk', 'maniwala alalahanin isipin '
                                   'intindihin mapagtanto magduda '
                                   'umasa magtiwala pagkatiwalaan sabihin magsinungaling '
                                   'mangako '
                                   'magsisi magselos'),
    ('connectors and sequence', 'samakatuwid gayunman gayunpaman subalit ngunit datapwat bukod '
                                'bilang kaysa kundi sakali '
                                'sa_wakas una_sa_lahat pagkaraan '
                                'kalaunan habang '
                                'tulad halimbawa kahit_na upang para'),
]

INVENTORY['b1'] = B1
