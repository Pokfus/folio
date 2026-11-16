#!/usr/bin/env python3
"""The hand-written topic inventory of each Navajo level.

Each level is a list of (topic, words): space-separated headwords as English
Wiktionary files them, `_` for a space, and `:pos` where the word has entries of
several parts of speech and only one is meant.  A word not in Wiktionary is
reported by select.py and dropped -- never invented.  A word Wiktionary has only
as a FORM of another (`shimá` "my mother") resolves to that word (`amá`).

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`navajo_level.SCOPE`).  Every word below
was looked up in the extract before it was written here (2026-11-16).

HOW NAVAJO FILES ITS WORDS, which the list follows:
  · A NOUN for a body part or a relative cannot stand alone: it is always
    somebody's.  Wiktionary files it under the "indefinite" a- form (`amá`
    "mother", `ajáád` "leg"), and the card prints its "my" and "his/her" forms
    (`shimá`, `bimá`).
  · A VERB is filed in the third person of the imperfective, so its English is
    "he/she is eating it" (`yiyą́`), and the card prints its "I" form where
    Wiktionary gives one.  A COLOUR or a size is a verb too (`łigai` "it is white").
  · A POSTPOSITION is filed in the third person (`bił` "with him/her"); "with me"
    is `shił`.

What A1 would have and the source does NOT (2026-11-16): a written-out "Navajo"
people name (Naabeehó), "English language" (Bilagáana bizaad), "to write", "to
learn", "to come", "window" (Wiktionary's tsésǫʼ is "mica").
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'yáʼátʼééh:intj ahéheeʼ aooʼ dooda hágoóneeʼ tʼáá_shǫǫdí'),
        ('pronouns and pointing words',
         'shí ni:pron bí nihí daabí éí díí nléí ńléí kodi áadi ákǫ́ǫ́'),
        ('question words',
         'háí haʼátʼíí háadi háágóó háádę́ę́ʼ hádą́ą́ʼ haash díkwíí daʼ'),
        ('introducing yourself',
         'wolyé diné diné_bizaad bilagáana dóoneʼé kéyah saad naatʼáanii'),
        ('people and the family',
         'hastiin asdzą́ą́ asdzání ashkii atʼééd awééʼ áłchíní amá azhéʼé acheii amásání '
         'análí atsilí adeezhí hádí achʼooní akʼéí dinééh:noun chʼikę́ę́h'),
        ('numbers',
         'łáaʼii naaki tááʼ dį́į́ʼ ashdlaʼ hastą́ą́ tsostsʼid tseebíí náhástʼéí neeznáá naadiin '
         'neeznádiin mííl'),
        ('time and how often',
         'kʼad díí_jį́ yiską́o adą́ą́dą́ą́ʼ abínígo jį́ tłʼééʼ nááhai óola:noun damóo hai shį́ dą '
         'aakʼeed haigo shį́įgo ałkʼidą́ą́ʼ łahda łeh tʼáá_íídą́ą́ʼ '
         'tʼáá_ákwíí_jį́ tłʼéédą́ą́ʼ jį́įgo hoolʼáágóó tʼah:particle tʼahdii:adv nááná dííshjį́'),
        ('how: manner and amount',
         'tsį́įłgo hah tąądee hazhóʼó nizhónígo yáʼátʼéehgo tʼóó_ahayóí tsʼídá haʼátʼéego'),
        ('food and drink',
         'chʼiyáán bááh atsįʼ abeʼ gohwééh tó naadą́ą́ʼ naaʼołí nímasii ayęęzhii áshįįh '
         'áshįįh_łikan bilasáana dzidzétsoh taʼneeskʼání łeesʼáán atooʼ chʼil'),
        ('animals',
         'łééchąąʼí mósí łį́į́ʼ béégashii dibé tłʼízí naaʼahóóhai gah mąʼii shash tsídii łóóʼ '
         'tłʼiish chʼosh bįįh tązhii atsá'),
        ('the home and the town',
         'hooghan kin dáádílkał tsáskʼeh bikááʼ_adání óltaʼ atiin chidí kin_shijaaʼ kintah '
         'béeso naalyéhé_bá_hooghan chʼiyáán_bá_hooghan naaltsoos azeeʼálʼį́ azeeʼííłʼíní '
         'báʼóltaʼí ółtaʼí'),
        ('the body and feeling ill',
         'atsiiʼ atsiitsʼiin aniiʼ anááʼ ajaaʼ áchį́į́h azééʼ awooʼ akʼos awos gaan álaʼ akeeʼ ajáád '
         'abid atsʼíís dił azeeʼ diniih daatsaah'),
        ('the weather and the land',
         'níłtsą́ yas níłchʼi shá:noun ooljééʼ sǫʼ yá:noun kʼos kǫʼ deesdoi sikʼaz hoozdo dził tooh tsin '
         'tsé séí tłʼoh nahasdzáán'),
        ('clothes and things in the home',
         'ééʼ chʼah tłʼaakał tłʼaajįʼééʼ éétsoh ásaaʼ łeetsʼaaʼ bééshʼadeeʼ béésh_biiʼ_kǫʼí '
         'níłchʼi_naalkidí biłńjoobałí'),
        ('directions and places',
         'haʼaʼaahjí shádiʼááhjí eʼeʼaahjí náhookǫsjí áhání tónteel beʼekʼid tsintah ałnííʼ'),
        ('colours',
         'łigai łizhin łichííʼ dootłʼizh łitso łibá dibéłchíʼí łitsxo'),
        ('describing words',
         'nizhóní yáʼátʼééh:verb nitsaa áłtsʼíísí nineez łikan yázhí:adj ayóo hózhǫ́ ániid sání '
         'sido'),
        ('the everyday verbs',
         'yáłtiʼ naaghá yigááł yighááh yiyą́ yidlą́ ałhosh naalnish ółtaʼ yółtaʼ ííłʼį́ sidá '
         'yooʼį́ yinízin nízin naané hataał:verb nayiiłniih haniih ní:verb hólǫ́ átʼé ádin:verb '
         'ákótʼé naʼnitin:verb yicha yiłtʼees yidiitsʼaʼ adiitsʼaʼ hiná kééhatʼį́ sizį́ '
         'yíkááh yíghááh hainitá jiní hágo'),
        ('postpositions, particles and linking words',
         'bił:postp bee baa bá biih biyiʼ bikááʼ:postp yah tʼáá doo da dóó áádóó ndi háálá '
         'índa ałdóʼ łaʼ tʼáá_ałtso azhą́ lá bikʼeh:postp'),
    ],
    'a2': [
        ('work and jobs',
         'naalnishí naanish azeeʼ_neiikáhí kʼéédidléhí hataałii béésh_łigaii_ííłʼíní siláołtsooí '
         'ásizį́ bíhólníihii ánihwííʼaahii chʼiyáán_ííłʼíní akał_bistłeeʼii naʼałbąąsii'),
        ('school and learning',
         'óltaʼ_hótsaa íhwiidooʼáłígíí saad_bee_álʼíní haneʼ_binaaltsoos haneʼ yízhí eʼelyaa '
         'yíhoołʼaah yíiyiiłʼaah yikʼeʼełchí naʼídíłkid yénálniih naʼashchʼąąʼ'),
        ('free time, music and games',
         'daʼnílʼį́ azhish daanéʼé awééshchíín ahóóhai sin jooł alzhish yidloh dloh dilwosh naabé'),
        ('ceremony, prayer and festivals',
         'nahaghá sodizin hatáál ééʼneishoodii_bikin diyin Késhmish biʼdizhchínę́ęjį́_anáyííłką́ '
         'kʼé ił_hózhǫ́ sih'),
        ('money and places in town',
         'tsindáo naaltsoos_bá_hooghan béeso_bá_hooghan kin_łání kin_haalʼá daʼnitiingóó naʼnízhoozh'),
        ('getting about',
         'tsinaabąąs chidí_naatʼaʼí kǫʼ_naʼałbąąsii dziʼizí chidítsoh diighááh nízaad'),
        ('the home and the yard',
         'tsésǫʼ hooghan_bikááʼ anítʼiʼ łį́į́ʼ_bighan chʼiyáán_álʼíní_góneʼ chizh nił bílaʼ_dį́įʼii '
         'bee_adlání łeetsʼaaʼ_nímazí tózis tó_bee_naakáhí tsitsʼaaʼ bikááʼdahʼasdáhí náʼoolkiłí '
         'naʼalkidí béésh_bee_haneʼé béésh_halneʼé akʼah_diltłiʼí tsitłʼéłí tłʼóół tsah '
         'béésh_ahédiłí biiʼadéestʼį́į́ʼ táláwosh bee_ádítʼoodí bee_nahazhoohí'),
        ('clothes and jewellery',
         'kénééz kétiil deijiʼ_ééʼ éénééz yoostsah yooʼ ił_dah_nátʼáhí azaʼazis bighaaʼ '
         'dah_iistłʼǫ́ ndikʼąʼ hadinééh'),
        ('food and cooking',
         'taosʼniiʼ dííkʼǫsh béégashii_bitsįʼ bisóodi_bitsįʼ náshgǫzh naaʼahóóhai_biyęęzhii géeso '
         'mandagíiya náneeskaadí naayízí naayízíłtsooí chʼééhjiyáán tłʼohchin azeedíchʼííʼ '
         'chąąshtʼezhiitsoh chʼil_łichíʼí chʼil_łigai hashkʼaan dzidzé neeshchʼííʼ ałkʼésdisí '
         'basdéél bááh_łikaní abeʼ_yistiní chʼil_ahwééh tsísʼná_bitłʼizh alóós neeshjízhii '
         'ntsidigoʼí abínígo_daʼadánígíí yistʼé dichin dibááʼ akʼáán yiłbéézh yibéézh sitʼé yitʼees'),
        ('animals of the farm and the wild',
         'łį́į́ʼtsaʼii łéʼéyázhí dzaanééz dóola achʼozh dibé_yázhí deenástsʼaaʼ tłʼízí_yázhí bisóodi '
         'naalʼeełí néʼéshjaaʼ dzílí gáagii zhį́ʼii dahiitį́hii kʼaalógii tsísʼná dǫ́ʼ chʼał tsisteeł '
         'łéʼétsoh dlǫ́ǫ́ʼ hazéítsʼósí dahsání gólízhii nahashchʼidí jádí náshdóí gahtsoh dzééh '
         'ayání mąʼiitsoh atseeʼ atʼaʼ adeeʼ atsʼos'),
        ('the land and the plants',
         'dah_azką́ yílkʼid tééh halgai aʼáán bikooh tó_nilį́į́h tábąąh tséchʼil tsʼah akʼǫ́ǫ́ʼ akétłʼóól '
         'atʼąąʼ atsʼáozʼaʼ tsékooh tsintah gad tʼiis tsáʼásziʼ chʼilátah_hózhóón hashtłʼish'),
        ('the weather and the sky',
         'łid siil áhí náátsʼíílid iiʼniʼ tin níló sháńdíín chahaʼoh hayoołkááł iʼííʼą́ hííłchʼįʼ '
         'chahałheeł atsiniltłʼish nahałtin níyol'),
        ('days, months and the time of day',
         'damį́įgo ńdízídígíí Damóo_Biiskání Damóo_dóó_Naakijį́ ndaʼiiníísh Damóo_yázhí '
         'Yas_Niłtʼees atsá_biyáázh Wóózhchʼį́į́d Tʼą́ą́chil Tʼą́ą́tsoh Yaʼiishjááshchilí '
         'Yaʼiishjáástsoh Biniʼantʼą́ą́tsʼózí Biniʼantʼą́ą́tsoh ghąąjįʼ Níłchʼitsʼósí Níłchʼitsoh '
         'tłʼéʼííłnííʼ díítłʼééʼ abínídą́ą́ʼ kóhootʼéédą́ą́ʼ náádamóogo daan'),
        ('directions',
         'haʼaʼaah náhookǫs shádiʼááh eʼeʼaah aghą́ą́ʼ atłʼááh tłʼóóʼdi wóyah gónaa'),
        ('the body',
         'álázhoozh akézhoozh áláshgaan álátsoh achʼoozhlaaʼ agod anághah ayid atéél ajéídíshjool '
         'azid atsʼin akágí adoh adáyiʼ ayaatsʼiin aniitsįʼ adaaʼ anátʼéézh adághaaʼ átááʼ akʼaiʼ '
         'atsooʼ atsiighąąʼ'),
        ('health and feeling ill',
         'łóód dikos tahoniigááh daʼatsaah azeeʼ_nímazígíí hátásiil ayol awosh naʼiidzeeł '
         'ákwii hakʼaz'),
        ('feelings and character',
         'hachįʼ náldzid yináldzid joobaʼ hashké hóyą́ diigis áháchįʼ nahatʼá yíní aaníinii yoochʼííd '
         'oodzííʼ aniné baaʼ anaʼí'),
        ('family and people',
         'akʼis atsiʼ achʼéʼé azeedí alah hóyáanii sáanii asdzáán atsóí naakaii'),
        ('the everyday verbs',
         'atłʼó yitłʼó náʼáłkad naalzheeh neiniłkaad kʼiidilé tánéígis yidleesh nidaah kʼédǫǫh niteeh '
         'iiłháásh chʼínádzííd hanályį́į́h yitseeł yiłdeeł haleeh noosééł yiniʼįįh oołbįįh '
         'haidiłbin yiłgan ánéídlééh yinaalnish digeeh honinééh ńdiiʼnééh yénálniih'),
        ('describing words',
         'nidaaz ászólí deení nantłʼah yilzhólí dilkǫǫh ditłééʼ yíłtseii neezílí sikʼází díchʼííʼ '
         'díkʼǫ́ǫ́zh nichǫ́ǫ́ʼí baaʼih niteel áłtsʼóózí áníłtsááz áłtʼą́ʼí łikʼaii nímaz dikʼą́ kʼézdon '
         'digiz haastih ániidí déesxéél hojoobáʼí atʼį́ niłhin'),
        ('how, how much and when',
         'tʼahaaʼgo tʼáá_sáhí tʼáá_ahąąh łą́ łą́ągo bíighah adih áłtsé tʼáá_áłahjįʼ tsʼídá_háadi_da '
         'tʼáá_ahą́ą́h átʼah áníídí kʼasdą́ą́ʼ shaʼshin tʼáá_íiyisíí éiyá tʼahdoo yaago tʼáá_ałtsogo '
         'hooghangóó áłah'),
        ('postpositions',
         'bitsi bitaʼ bitis biná áchʼą́ą́h bikééʼ:postp'),
        ('numbers past ten, and how many times',
         'łaʼtsʼáadah tááʼtsʼáadah dį́į́ʼtsʼáadah ashdlaʼáadah hastą́ʼáadah tsostsʼidtsʼáadah '
         'náhástʼéítsʼáadah dízdiin ashdladiin hastą́diin tsostsʼidiin tseebídiin náhástʼédiin '
         'átsé tááʼ_góneʼ dį́į́ʼ_góneʼ ashdlaʼ_góneʼ dį́įʼdi táadi námboo naakiiyáál yáál'),
        ('colours, shades and stones',
         'dinilbá dinilgai diniltso dinilchííʼ yágo_dootłʼizh chʼilgo_dootłʼizh béésh_łigaii '
         'dootłʼizhii diichiłí bááshzhinii béésh béésh_łichíiʼii tsékǫʼ ntłʼiz'),
        ('the community and government',
         'chidí_bitooʼ chidí_bighan tsáskʼeh_bá_hooghan daʼjiyání awáalya nanidaahii bee_hazʼáanii '
         'naaltsoos_ahiʼnííł dah_naatʼaʼí ałtį́į́ʼ kʼaaʼ honeesnánígíí'),
        ('the hogan, the camp and the farm',
         'awéétsʼáál táchééh yah_ańdajikahí chʼíláyiʼ biiʼazkʼazí tó_bá_azʼání dáʼdeestłʼin naʼniyęęsh '
         'łį́į́ʼ_biyéél bee_atsxis tsiiʼáál dáádiníbaal tsitsʼaaʼ_naadloʼí béeso_bizis yoołkáłí níbaal '
         'kǫʼkʼeh chizhtsʼósí bee_nʼdildlaadí jaaʼí tó_bee_nániildohí tseeʼé haazʼéí bee_atsidí '
         'ił_adaalkaałí bee_achʼiishí bééshtsʼósí akał abaní kélchí ké_yistłóní lájish bee_chahaʼohí '
         'bee_alzhóhí awooʼ_bee_yichʼiishí látsíní anilí'),
        ('ceremony, story and craft',
         'kʼeetʼáán aghááł tsʼisǫ́ǫ́s iikááh bahaneʼ nahatʼiʼ atłʼóóh naʼachʼąąhí hazaʼaleeh tádídíín'),
        ('the family, more',
         'doishʼíinii aadaaní akʼis ádí ánaaí'),
        ('plants and food, more',
         'chʼó kʼaiʼ ndíyíliitsoh hosh_niteelí naadą́ą́ʼ_dootłʼizhí ałkʼíniilgizh sáál bááh_nímazí '
         'tóshchíín alkąąd'),
        ('school and sport',
         'jooł_iih_nálniihí jooł_yitalí jooł_yikalí bee_kʼééʼálchxǫǫhí bee_ídaʼneelʼąąhí '
         'bee_akʼeʼelchíhí bee_naʼadzooí biiʼndaʼaʼnéhé haʼoodzííʼ saad_bee_hazʼáanii'),
        ('getting about, more',
         'chidí_diné_bee_naagéhí dziʼizítsoh kǫʼ_yiniłtsésí'),
        ('the land, the sky and the seasons, more',
         'tłʼoh_naadą́ą́ʼ taaskaal tłʼoh_waaʼí tsin_bineestʼąʼ chéchʼil_binááʼ kʼįįʼ díwózhii '
         'chʼil_awoshí ábishjaaʼ tsézéí tsétsoh hootso adahiilíní chézhin kéyah_haʼdéísná hodichįįh '
         'chííl náátsʼǫ́ʼoołdísii dahtooʼ yikáísdáhí sǫʼtsoh ałneʼííʼáázh'),
        ('the sheep and the horse',
         'beeʼadizí asgąʼ azaatłʼóól atsiighaʼ'),
        ('more verbs',
         'yidiitsʼį́į́h shóyoołtʼeeh sodilzin yiiltééh'),
        ('more everyday verbs',
         'chʼéghááh yidííniid háíghááh haisííd haigééd náltsááh yiníłʼį́ adlą́ yichʼid yiyiigis '
         'táʼádígis hadéébįįd áhályą́ niilníísh naʼídíłkid'),
    ],
}
