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

INVENTORY = {'a1': A1, 'a2': A2}
