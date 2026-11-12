#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Irish word list is published under a licence Folio can use (see
`irish_level.py`), so a level's CORE is written here, a topic at a time, for the
scope its CEFR descriptor sets; `select.py` resolves every word against
Wiktionary (a word not found there is reported and dropped, never invented a
meaning) and tops the level up with the commonest remaining words.

A word may carry a part of speech after a colon (`ar:prep`) where the spelling
is shared and the level wants one reading first.  An underscore joins a
multi-word entry (`dia_duit`).  Spellings are Wiktionary's headwords: a verb by
its IMPERATIVE SINGULAR, the form Irish dictionaries head it by (`déan` "do",
`téigh` "go"), a noun in the nominative singular (`teach`), an adjective in its
basic form (`mór`); the months, days and languages capitalised, as Irish
writes them.
"""

A1 = [
    ('pronouns', 'mé tú sé:pron sí:pron muid sibh siad é í iad féin'),
    ('possessives', 'mo do a:det ár bhur'),
    ('the article and pointing words', 'an:article seo sin siúd eile gach aon:det uile'),
    ('questions', 'cad cé cá conas cathain cén_fáth cé_mhéad cén'),
    ('prepositions and place words', 'ag:prep ar:prep le de i ó:prep faoi roimh as:prep chuig idir thar gan '
                                     'anseo ansin ansiúd thall istigh amuigh suas síos isteach amach '
                                     'tar_éis i_ndiaidh de_réir i_measc ar_feadh ar_aghaidh '
                                     'thuas thíos abhaile'),
    ('conjunctions and little words', 'agus ach nó mar:conj go:conj nach má:conj ní:particle níos freisin fós '
                                      'anois inniu inné amárach riamh i_gcónaí uaireanta arís go_leor '
                                      'beagnach chomh'),
    ('greetings and politeness', 'Dia_duit slán:intj fáilte le_do_thoil go_raibh_maith_agat '
                                 'gabh_mo_leithscéal oíche_mhaith maidin_mhaith'),
    ('numbers', 'náid aon:num dó trí:num ceathair cúig seacht ocht naoi deich fiche tríocha daichead '
                'caoga céad míle dara tríú leath'),
    ('time', 'am uair nóiméad lá oíche maidin tráthnóna seachtain mí bliain clog anocht luath '
             'déanach deireadh_seachtaine'),
    ('days', 'Luan Máirt Céadaoin Déardaoin Aoine Satharn Domhnach'),
    ('months', 'Eanáir Feabhra Márta Aibreán Bealtaine Meitheamh Iúil Lúnasa Meán_Fómhair '
               'Deireadh_Fómhair Samhain Nollaig'),
    ('family', 'teaghlach máthair athair deartháir deirfiúr mac iníon bean fear páiste leanbh '
               'buachaill cailín seanmháthair seanathair cara uncail aintín daidí mamaí'),
    ('people and yourself', 'ainm aois tír cathair teanga Gaeilge Béarla Fraincis Éire obair post '
                            'dalta múinteoir dochtúir duine'),
    ('the body and feeling ill', 'ceann lámh cos súil cluas béal srón fiacail gruaig droim bolg '
                                 'tinn tinneas pian ospidéal'),
    ('food and drink', 'bia deoch uisce bainne tae caife arán im cáis feoil iasc sicín ubh úll '
                       'oráiste práta glasra siúcra salann bricfeasta lón dinnéar béile ocras tart'),
    ('the home', 'teach seomra cistin leaba doras fuinneog bord cathaoir urlár balla gairdín '
                 'leithreas staighre árasán eochair'),
    ('the town and getting about', 'baile sráid siopa scoil séipéal banc óstán bialann '
                                   'teach_tábhairne stáisiún bus traein carr rothar aerfort páirc '
                                   'leabharlann oifig ticéad bóthar'),
    ('shopping and money', 'airgead euro praghas saor daor'),
    ('the weather', 'aimsir báisteach grian gaoth sneachta tirim fliuch scamall'),
    ('colours', 'dath dearg gorm glas buí bán dubh donn liath bándearg corcra'),
    ('describing', 'mór beag maith olc:adj nua sean óg fada gearr deas:adj álainn sona brónach tuirseach '
                   'éasca:adj deacair te fuar gnóthach ard íseal'),
    ('verbs', 'bí is:particle déan téigh tar feic clois abair faigh tabhair ith ól codail oibrigh '
              'foghlaim léigh scríobh labhair éist féach ceannaigh díol íoc imigh fan suigh seas siúil '
              'rith cuir glac:verb oscail dún:verb tosaigh críochnaigh cabhraigh tuig ceap:verb smaoinigh bris '
              'caith teastaigh taitin glan nigh cónaigh imir can'),
    ('things and free time', 'rud leabhar peann páipéar ríomhaire fón ceol scannán cluiche spórt '
                             'peil madra cat capall bó éan teilifís'),
]

# A2 (2026-11-12), scoped to the CEFR A2 descriptor (`irish_level.SCOPE['a2']`).
A2 = [
    ('seasons and dates', 'earrach samhradh geimhreadh dáta lá_breithe féile'),
    ('numbers', 'ceathrú cúigiú séú seachtú ochtú naoú deichiú seasca seachtó ochtó nócha '
                'triúr ceathrar cúigear seisear'),
    ('the land and nature', 'farraige trá sliabh cnoc coill crann bláth féar spéir réalta gealach '
                            'tine aer cloch carraig gleann tuath feirm dúlra'),
    ('the weather', 'stoirm ceo toirneach scamallach grianmhar gaofar teocht sioc'),
    ('animals', 'ainmhí caora muc cearc lacha luch francach sionnach coinín béar leon moncaí'),
    ('clothes', 'éadach léine geansaí bríste gúna sciorta cóta hata bróg stoca lámhainn scairf mála '
                'spéaclaí'),
    ('the home and the kitchen', 'cuisneoir sorn oigheann pláta cupán gloine scian forc spúnóg pota '
                                 'tolg cuirtín lampa seilf vardrús seomra_codlata seomra_suí'),
    ('food and cooking', 'anraith rís cabáiste cairéad oinniún tráta banana sú fíon beoir '
                         'uachtar_reoite cáca briosca seacláid mil subh bruith róst'),
    ('work and jobs', 'comhlacht fostaí bainisteoir pá tuarastal cruinniú feirmeoir garda altra '
                      'innealtóir cócaire tiománaí fiaclóir'),
    ('school', 'rang ceacht scrúdú obair_bhaile mac_léinn matamaitic eolaíocht tíreolaíocht'),
    ('travel and transport', 'turas saoire eitleán bád long pas stad léarscáil'),
    ('the town', 'margadh ollmhargadh caisleán droichead cearnóg músaem pictiúrlann amharclann '
                 'linn_snámha'),
    ('health', 'slaghdán fiabhras leigheas poitigéir cógaslann casacht gortaigh'),
    ('feelings', 'áthas brón eagla fearg imní grá sásta feargach bródúil uaigneach'),
    ('free time', 'snámh damhsa rince ceolchoirm péint grianghraf siopadóireacht '
                  'iománaíocht'),
    ('verbs', 'buail bog:verb cas:verb fill iarr freagair múin cuimhnigh lig mothaigh roghnaigh seol:verb tiomáin '
              'taistil ullmhaigh athraigh bailigh coinnigh tit caill aimsigh stad:verb gáir caoin:verb troid'),
    ('describing', 'ciúin glórach saibhir bocht láidir lag tanaí ramhar folamh lán salach tapa mall '
                   'cliste dathúil gránna cairdiúil cineálta greannmhar suimiúil leadránach trom '
                   'éadrom leathan cúng dorcha geal'),
    ('people', 'comharsa déagóir cuairteoir strainséir seanduine tuismitheoir garmhac gariníon nia '
               'neacht fear_céile bean_chéile'),
    ('the body', 'muineál gualainn glúin méar croí fuil craiceann uillinn rúitín'),
    ('communication', 'litir ríomhphost teachtaireacht guthán idirlíon nuachtán raidió scéal'),
    ('shopping', 'cárta costas sladmhargadh siopadóir malairt sóinseáil admháil'),
    ('more food', 'ispín bagún liamhás mairteoil sceallóg uachtar ola piobar gairleog cnó'),
    ('around the house', 'scuab iarnáil cócaráil'),
    ('more verbs', 'léim eitil fiafraigh glaoigh cuardaigh cuidigh seinn iompaigh brúigh tarraing '
                   'sábháil luigh dúisigh gléas cíor bearr'),
    ('more describing', 'ocrach réidh compordach sábháilte contúirteach cáiliúil fiáin uafásach iontach '
                        'difriúil simplí deireanach áitiúil'),
    ('the house, more', 'díon simléar clós garáiste cófra citeal tóstaer babhla naipcín tuáille '
                        'gallúnach scáthán folcadán cith doirteal piliúr blaincéad'),
    ('the town, more', 'carrchlós tacsaí crosbhóthar cosán príomhoide peann_luaidhe rialóir cóipleabhar '
                       'foclóir'),
    ('sport', 'liathróid rás rothaíocht rugbaí cispheil galf'),
    ('feelings, more', 'náire ionadh díomá sceitimíní trua teas fuacht'),
    ('the body, more', 'cnámh matán scornach liopa smig'),
    ('time, more', 'meán_lae meán_oíche coicís'),
    ('describing, more', 'oscailte dúnta briste cúramach macánta leisciúil ciallmhar dána cróga '
                         'sláintiúil blasta milis searbh goirt'),
    ('verbs, more', 'blais triomaigh cóirigh deisigh comhair:verb geall:verb'),
    ('clothes and animals, more', 'buatais cnaipe póca uaireadóir fáinne muince gabhar asal tarbh '
                                  'damhán_alla beach féileacán nathair míol_mór deilf'),
    ('time words', 'anuraidh ar_ball láithreach:adv cheana'),
    ('connectors', 'mar_sin ach_oiread cé_go toisc:prep dá:conj sula go_dtí áfach ionas_go'),
]

# B1 (2026-11-12), scoped to the CEFR B1 descriptor (`irish_level.SCOPE['b1']`).
B1 = [
    # English Wiktionary lacks many everyday modern Irish words (comhshaol, infheistíocht, troscán,
    # athchúrsáil, mothúchán ...), and a word with no entry is never given a meaning here; this list
    # is the B1 scope as far as the dictionary reaches (`docs/irish-decks-plan.md` §8).
    ('work and the economy', 'fostaíocht dífhostaíocht gairm oiliúint cáilíocht taithí iarratas agallamh '
                             'brabús caillteanas geilleagar iasacht airgeadra easpórtáil fógraíocht custaiméir '
                             'monarcha tionscal fostaigh bainistíocht fostóir oibrí ceardchumann stailc '
                             'pinsean scor dualgas freagracht spriocdháta scil cumas deis tairbhe táille '
                             'sparán cuntas_bainc airgeadas buiséad'),
    ('society and politics', 'páirtí dlí saoránach sochaí bochtaineacht imirce inimirce comhionannas agóid '
                             'agóideoir cearta_daonna  dlíodóir foréigean sábháilteacht slándáil '
                             'daonlathas reachtaíocht bunreacht éagóir easaontas vótáil'),
    ('media and technology', 'meáin nuacht suíomh_gréasáin aip  bogearraí scáileán físeán '
                             'ceamara méarchlár pasfhocal fógra preas irisleabhar láithreoir '
                             'grianghrafadóir líonra ríomhaire_glúine'),
    ('the environment', 'bruscar foraois nádúr truailligh dramhaíl plaisteach timpeallacht caomhnú '
                        'éiceolaíocht carbón tuile triomach'),
    ('education', 'léacht léachtóir eolas marc teastas aiste meánscoil bunscoil scoláireacht céimí '
                  'iarchéimí foghlaimeoir léitheoireacht litriú gramadach forbairt'),
    ('relationships', 'cairdeas pósadh colscaradh leannán muinín réiteach lánúin baintreach cleamhnas '
                      'bainis ceiliúradh cairdiúlacht cúnamh'),
    ('home and housing', 'cíos tiarna_talún lóistín tionónta comharsanacht bruachbhaile tithíocht úinéir '
                         'tionóntacht baile_beag leictreachas'),
    ('health', 'aclaíocht aiste_bia meáchan ailléirge cógas otharcharr éigeandáil strus folláine dúlagar '
               'scíth codladh tuirse cothú vitimín víreas ionfhabhtú vacsaín obráid créacht'),
    ('travel and experiences', 'eachtrannach turasóir áirithint custam aistear eitilt turasóireacht '
                               'ceann_scríbe tráthchlár iarnród stáisiún_traenach bagáiste'),
    ('culture and leisure', 'dánlann taispeántas seó aisteoireacht béaloideas seanchas sean-nós seisiún '
                            'fidil feadóg bodhrán dealbh dealbhóir péintéireacht pictiúr ceoldráma'),
    ('feelings and opinions', 'dóchas éadóchas faoiseamh sásamh dearcadh amhras bród éad uaigneas misneach '
                              'sonas aoibhneas mearbhall'),
    ('explaining and arguing', 'fáth éifeacht buntáiste míbhuntáiste cinneadh moladh argóint conclúid '
                               'aighneas'),
    ('verbs', 'ceartaigh áitigh cinntigh measúnaigh admhaigh dearbhaigh séan:verb fulaing seachain tréig '
              'samhlaigh scrúdaigh fiosraigh tuar:verb treoraigh'),
    ('judging', 'riachtanach úsáideach cinnte éiginnte dodhéanta féideartha cothrom mícheart dóchúil '
                'dáiríre dearfach diúltach oiriúnach cruinn éifeachtach casta soiléir annamh aisteach '
                'furasta crua réasúnta luachmhar cumasach dílis'),
    ('time and frequency', 'de_ghnáth faoi_láthair feasta ar_dtús ar_deireadh le_déanaí roimh_ré '
                           'todhchaí fadó'),
    ('connectors', 'mar_sin_féin dá_bhrí_sin ar_aon_nós ar_aon_chaoi go_háirithe mar_shampla ar_nós '
                   'murach ach_amháin mura chomh_maith cé_nach ar_eagla_go'),
]

# B2 (2026-11-12), scoped to the CEFR B2 descriptor (`irish_level.SCOPE['b2']`).  Written, as B1's was,
# from candidates tested against the extract: English Wiktionary lacks most of the formal vocabulary
# of modern Irish (reifreann, freasúra, athrú aeráide, caiteachas, iomaíocht ...), and many of the
# words it has are already taught by the frequency fill of A1 to B1 (`docs/irish-decks-plan.md` §9).
B2 = [
    ('the economy', 'boilsciú creidmheas iasachtaí tomhaltóir táirgeadh maoiniú sochar cuntasóir cuntasaíocht '
                    'brabúsach easnamh'),
    ('politics and the state', 'rialú tánaiste idé-eolaíocht cumannachas caipitleachas impiriúlachas '
                               'cogadh_cathartha teifeach dídeanaí maorlathas bainisteoireacht'),
    ('law and justice', 'giúiré fíneáil cosaint achomharc ceartas daoradh gadaí calaois éilliú breab'),
    ('science and technology', 'hipitéis aireagán cill ríomhchlárú intleacht_shaorga teicneoir '
                               'ríomhchláraitheoir brabhsálaí príobháideacht triantán dronuilleog'),
    ('the environment', 'bithéagsúlacht éiceolaí laghdú forás nuálaíocht nua-aimsearthacht'),
    ('health and society', 'galar_tógálach paindéim vacsaíniú aosach pinsinéir litearthacht dídean '
                           'andúil máinlia máinliacht altranas teiripe eitneachas leatrom cothromaíocht '
                           'feimineachas aerach'),
    ('mind, belief and identity', 'síceolaíocht síceolaí socheolaíocht socheolaí eitic aindiachaí agnóisí '
                                  'spleách spleáchas náisiúntacht dátheangachas teanga_dhúchais'),
    ('culture', 'léiriú réalachas meafar íoróin aoir seandálaí iarsmalann'),
    ('the abstract nouns of discussion', 'laige láidreacht toise claonadh treocht toimhde measúnú seasamh '
                                         'dearbhú feasacht tuiscint aineolas pobalbhreith suirbhé staitistic '
                                         'cobhsaíocht éiginnteacht contúirt riosca'),
    ('verbs of arguing and acting', 'anailísigh lochtaigh cuir_chun_cinn cosc teorannaigh ionadaigh '
                                    'cuir_i_bhfeidhm imscrúdaigh'),
    ('describing and evaluating', 'ábhartha éifeachtúil eiticiúil dleathach réasúnach réadúil teibí fiosrach '
                                  'dúthrachtach díograis díograiseach'),
    ('formal connectors', 'de_bharr mar_gheall_ar ar_ndóigh i_ndeireadh_na_dála maidir_le i_dtaca_le '
                          'ar_mhaithe_le in_ainneoin'),
]

# C1 (2026-11-12), scoped to the CEFR C1 descriptor (`irish_level.SCOPE['c1']`).  Of about 230 candidates
# tested against the extract, these are the ones English Wiktionary has and no lower level teaches
# (`docs/irish-decks-plan.md` §10): the level is almost wholly the frequency tail.
C1 = [
    ('academic and intellectual', 'léann modheolaíocht téis tagairt oideolaíocht'),
    ('society and governance', 'breithiúnacht coimeádachas tíorántacht frithbheart'),
    ('the economy', 'gnóthachan cáilmheas luamhán cúlú'),
    ('law and ethics', 'ciontacht ionracas dlisteanacht'),
    ('mind and behaviour', 'comhfhios fo-chomhfhios aireachtáil réasúnaíocht iompar spreagadh féinmhuinín'),
    ('language and rhetoric', 'reitric beachtas'),
    ('the abstract nouns of analysis', 'nasc contrárthacht castacht'),
    ('verbs and adjectives of formal argument', 'cuir_in_iúl aonchineálach críonna stuama grinn'),
    ('formal connectors', 'ar_a_laghad'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
