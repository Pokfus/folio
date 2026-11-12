#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Hausa has no published graded word list (see `hausa_level.py`), so a level's
CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary and the hand glosses
(`hand.py`) -- a word in neither is reported and dropped, never given a meaning
on the fly -- and tops the level up with the commonest remaining words.

A word may carry a part of speech after a colon (`ci:verb`) where the spelling
is shared and the level wants one reading first; an underscore joins a
two-word entry (`ruwan_sama`).  Spellings are the ordinary Boko spellings,
hooks included (ɗ ƙ ɓ, and 'y); matching goes through `ha.norm`, so tone marks
never matter.

ONE CARD PER SPELLING.  Hausa writes several common words alike that tone and
vowel length tell apart in speech -- `kai` "you (a man)" and "head", `suna`
"they are (doing)" and "name", `ina` "where?" and "I am (doing)" -- and the
card is the spelling a learner meets, so it carries each meaning (`hand.py`
and Wiktionary between them).
"""

A1 = [
    ('pronouns', 'ni kai ke shi ita mu ku su'),
    ('the continuous', 'ina kana kina yana tana muna kuna suna'),
    ('the completive', 'ka kin ya ta mun kun sun'),
    ('the future', 'zan zai za'),
    ('this and that', 'wannan wancan waɗannan nan can'),
    ('questions', 'me wa yaya yaushe nawa wane wace ina'),
    ('prepositions', 'da a na ga daga zuwa cikin kan bisa ƙarƙashin gaban bayan tare kusa wajen domin don'),
    ('conjunctions and particles', 'kuma amma ko idan saboda sai har kamar cewa ne ce ba babu akwai i a\'a to kawai ma dai fa kada'),
    ('greetings and politeness', 'sannu barka lafiya yauwa godiya gode maraba haƙuri gafara kwana'),
    ('numbers', 'ɗaya biyu uku huɗu biyar shida bakwai takwas tara goma ashirin talatin hamsin ɗari dubu rabi'),
    ('time', 'lokaci awa minti dare safe yamma yau gobe jiya yanzu mako wata shekara sa\'a kullum'),
    ('days', 'Litinin Talata Laraba Alhamis Jumma\'a Asabar Lahadi'),
    ('family', 'iyali uwa uba baba mama ɗa \'ya yaro yarinya ɗan\'uwa ƙane ƙanwa miji mata kaka jika aboki ƙawa mutum mace namiji'),
    ('people and yourself', 'suna ƙasa gari birni ƙauye harshe Hausa Turanci aiki ɗalibi malami likita'),
    ('food and drink', 'abinci ruwa shayi madara nama kifi ƙwai shinkafa wake tuwo miya burodi ayaba lemo gishiri sukari mai kofi'),
    ('shopping and money', 'kuɗi naira kasuwa shago saya sayar biya tsada arha farashi'),
    ('the home', 'gida ɗaki ƙofa taga tebur kujera gado littafi alƙalami waya mabuɗi'),
    ('the town and getting about', 'hanya titi mota bas jirgi tasha otal asibiti makaranta ofis banki masallaci coci dama hagu nesa'),
    ('the body and feeling ill', 'ido kunne hanci baki hannu ƙafa ciki haƙori jiki ciwo magani zazzaɓi'),
    ('weather', 'yanayi zafi sanyi ruwan_sama rana iska'),
    ('colours', 'launi ja fari baƙi kore shuɗi rawaya:adj'),
    ('describing', 'babba ƙarami sabo tsoho kyau mummuna dogo gajere sauƙi wuya yawa duk kaɗan sosai komai kowa wani wata'),
    ('everyday verbs', 'yi tafi je zo dawo ci sha tashi zauna tsaya gani ji faɗi magana karanta rubuta gane sani so iya zama kawo ɗauka bayar nema samu buɗe rufe tambaya gaya koya fara gama sa shiga fita koma hau sake riga'),
]

# A2 (2026-11-12): the CEFR A2 descriptor's "areas of most immediate relevance" --
# work, school, shopping, local geography, health, the home -- and the routine
# exchanges it names: getting about, the seasons and the calendar, food and cooking,
# clothes, free time, feelings, and the verbs, describing words and adverbs a
# simple account of one's day needs.  A1's words are skipped by `select.py`.
A2 = [
    ('numbers', "arba'in sittin saba'in tamanin casa'in miliyan"),
    ('months', 'Janairu Fabrairu Maris Afrilu Mayu Yuni Yuli Agusta Satumba Oktoba Nuwamba Disamba'),
    ('seasons', 'damina rani bazara hunturu'),
    ('time', 'ƙarfe kwata asuba maraice tsakar_dare jibi shekaranjiya daɗe tukuna koyaushe wuri daƙiƙa'),
    ('work and jobs', "wanzami injiniya mahauci masunci akawu sakatare makiyayi ɗan_jarida ma'aikaci manomi direba ɗan_sanda ɗan_kasuwa shugaba kamfani noma ciniki kafinta telo gona lada nas"),
    ('school and study', "allo roba fensir sakandare firamare maki digiri shaida laburare kimiyya lacca aji jami'a harafi taswira adadi babi maƙala mujalla"),
    ('clothes', 'kwalliya silifas ɗankwali rawani taguwa sarƙa kwala tufafi wando zane mayafi zobe kaya safa siket tabarau bel cire'),
    ('travel', 'babur raƙumi jaki fasfo tikiti iyaka baƙo tasi fasinja biza masauki'),
    ('the home and household', 'gilashi kwando guga shimfiɗa naɗe rataya firiji fanka tsani matakala bene silin tabarma kwalba tire ashana kyandir almakashi guduma gatari igiya zare reza buroshi tsefe turare laima banɗaki kicin katifa bargo kwano tukunya cokali wuƙa faranti buta rijiya famfo rufi madubi murfi tsintsiya sabulu tawul'),
    ('food and cooking', 'man_shanu kayan_marmari kayan_lambu taliya zogale kwakwa karas yaji kankana abarba gwanda zaitun romo daddawa ɗanɗana doya dankali rogo masara gero dawa albasa tumatir barkono mangwaro gyaɗa alkama cuku tafarnuwa inabi dabino goro kunu dafa soya yanka tafasa zuba'),
    ('nature', 'dusar_ƙanƙara guguwa danshi bakan_gizo reshe saiwa kwari yayyafi ambaliya toka daji ganye tafki tudu gajimare hadari ƙura hamada kurmi walƙiya aradu hazo tsibiri'),
    ('animals', 'kudan_zuma malam_buɗe_mana rago bunsuru dila ɓera tururuwa kyankyaso shaho ungulu talotalo ɓauna barewa karkanda ƙaho wutsiya kyanwa akuya tunkiya saniya zakara maciji giwa biri kura kunama sauro ƙuda zomo agwagwa kunkuru damisa mujiya kwaɗo tsutsa'),
    ('the body', 'durƙusa tsalle numfashi atishawa hamma kwakwalwa gira cinya diddige hanji maƙoshi gashi fuska fata leɓe kafaɗa ƙirji farce gemu kunci huhu hanta tsoka'),
    ('health', 'kwaya kiwon_lafiya cuta jinya kumburi karaya annoba mura tari rauni amai gudawa allura warke'),
    ('feelings', "ƙoshi barci mafarki gundura ƙiyayya dariya kuka murmushi sha'awa ladabi fara'a hassada kirki jarumi malalaci wawa farin_ciki baƙin_ciki fushi murna gajiya yunwa ƙishirwa ƙauna kishi alfahari"),
    ('free time', 'wasan_kwaikwayo ganga hira iyo makaɗi ƙwallo ƙwallon_ƙafa rawa kiɗa fim talabijin rediyo biki yawo dambe'),
    ('religion and festivals', 'Allah salla azumi musulmi Kirista Kirsimeti annabi aljanna sadaka'),
    ('people and the town', "gefe kusurwa waje ƙetare taro ritaya rangwame kwastoma ambulan gaisuwa ziyara ajiya kyauta sirri zumunci aminci haɗin_kai fasto kawu baffa gwaggo inna suruki jariri saurayi makaho kurma gidan_waya gidan_abinci kurkuku makabarta rumfa canji aljihu kilo bashi riba rahusa unguwa kanti dandali jiha ƙabila amarya ango maraya attajiri maƙwabci dattijo gwamna matashi"),
    ('messages and machines', 'imel caji lif saƙo kwamfuta intanet'),
    ('everyday verbs', 'aika bari bi ɓata ɗaura fahimta gyara hana jira kalla kashe kira kunna manta ƙara ƙare shirya taimaka tuna tura wanke wuce yanke zaɓa haɗa cika kama karɓa saurara yarda saka share ɗinka tuƙa lura ƙi kwanta gudu tsere roƙa sanar ɗaga yafe rasa sauya ɓoye bincika dakata haihu tauna aske shuka fassara:verb taɓa dace yiwu amince rantse ƙirga auna haƙa huta kwance goge maye fashe kori makara taru komo sara dage rama tofa ishe ɓace faru kasance fito shigo zagaya juya jefa harba ceto saki gaishe'),
    ('describing', 'zurfi kaifi taushi ƙauri haske duhu hayaniya kyakkyawa ɗumi ruwan_ƙasa ruwan_hoda ruwan_lemo kowane fiye ninki nauyi tsabta daɗi ɗaci tsufa sauri cike ɗanye ƙato muhimmi mashahuri ƙazami talauci ƙarfi daban'),
    ('adverbs and linking words', 'haka ƙwarai har_yanzu nan_da_nan watakila tabbas duka wato aƙalla kwatsam tuni lalle muddin'),
]

# B1 (2026-11-12): the CEFR B1 descriptor's "familiar matters regularly encountered in
# work, school, leisure" and connected speech about experiences, opinions and plans --
# government and the news, the law, money, health, the environment, travel's troubles,
# character and relationships, custom and religion -- and the abstract nouns, verbs and
# linking words that carry an argument.  Wiktionary's frequent words were all taken by A1
# and A2, so B1 is nearly all inventory: the words Wiktionary has (with a tone line) are
# preferred, and the rest are hand-glossed (`hand.HAND_B1`).
B1 = [
    ('opinions and arguing a point', 'hujja ƙarya tabbaci shakka yarjejeniya saɓani jayayya manufa buri niyya muhawara zato tsammani bayyana tattauna tabbatar musanta kwatanta'),
    ('verbs of change and effort', 'amfana samar haɓaka raunana ƙarfafa ƙalubale magance warware gudanar halarta kauce guje mallaka ƙaddamar kammala soke dakatar rage ƙaru ragu faɗaɗa canza ci_gaba damu tsorata gamsu burge yaba zargi hukunta tsare kiyaye tsira rayu buga watsa yaɗa ruwaito ambata faɗakar gargaɗi gayyata ziyarta tarbe tsara shiri aiwatar cimma gaza asara kuskure'),
    ('government and society', "zaɓe ɗan_siyasa 'yanci doka zaman_lafiya rikici tashin_hankali zanga-zanga ta'addanci gudun_hijira kisa fashi kasafin_kuɗi tattalin_arziki cinikayya masana'anta karkara jakada ƙungiya kwamiti babban_birni"),
    ('news, media and technology', 'rahoto bidiyo adireshi shafi kalmar_sirri wayar_hannu lantarki inji fasaha gwaji ƙirƙira'),
    ('education', 'farfesa koyarwa horo ƙwarewa gwaninta basira wayo Larabci'),
    ('health and the body', 'ƙanjamau tiyata rashin_lafiya rigakafi kiba motsa_jiki nakasa gurgu bebe hauka mahaukaci jijiya idon_sawu tafin_hannu kugu kwarangwal'),
    ('the environment', 'muhalli sauyin_yanayi gurɓata shara bola namun_daji ruwan_sha hayaƙi girgizar_ƙasa gobara yashi'),
    ('travel and its troubles', 'hatsari cunkoso jinkiri kwastam mararraba kuɗin_mota haya abin_hawa tuƙi filin_jirgin_sama tashar_mota yawon_buɗe_ido shaƙatawa'),
    ('work and business', 'manaja jari asusu rance kwangila rashin_aikin_yi ƙwararre gogewa sa_hannu abokin_aiki'),
    ('character and relationships', "mugunta girman_kai tawali'u cin_amana ha'inci maƙaryaci jaruntaka matsoraci abota dangi iyaye yarinta ƙuruciya rayuwa makoki ta'aziyya nagari ƙwazo kasala rashin_kunya hazaƙa dabara tagwaye auta reno uwar_gida mai_gida bazawara gwauro"),
    ('religion and custom', "lahira imani bikin_aure Alƙur'ani limami sarauta gargajiya liyafa"),
    ('the arts, media and sport', 'mawaƙi marubuci lambar_yabo ɗan_wasa kulob filin_wasa kunnen_doki alƙalin_wasa kokawa barkwanci raha nishaɗi'),
    ('linking words', 'saboda_haka don_haka ko_da_yake duk_da_haka duk_da maimakon banda sai_dai balle har_da game_da dangane_da ta_hanyar a_matsayin tun_da yayin_da lokacin_da har_sai gaba_ɗaya kusan sau_da_yawa nan_gaba kwanan_nan a_hankali da_gangan kaɗai haƙiƙa ainihi ko_kuma kamar_yadda inda wanda wadda waɗanda abin_da kowace wasu sauran da_yawa ƙari daidai'),
    ('abstract nouns', 'mafita bege muhimmanci matsayi mataki adalci kariya gudummawa batu'),
    ('more verbs', 'gano bambanta bambanci kula auri haɗu sadu rabu raba soma jinkirta hanzarta sarrafa jagoranta tanadi adana lalata lalace karye fasa gina gini rushe girbi kiwo farauta kamun_kifi farka ɗora sauke matsa matso kusanta nisanta tsallaka zame kulle furta raɗa ihu kururuwa zagi yabo shawarta umarni umarta buƙaci alƙawari sanya jawo zubar ɗebo kwashe shanya ninka yaga kunsa ɗaure riƙe nemo tattara rarraba fifita maimaita horar gwada ƙiyasta lissafa kwafa mayar kewaya ratsa raka bankwana sallama hango shaƙa firgita razana baƙanta faranta girmama raina wulaƙanta tsana'),
    ('feelings', 'fargaba kaɗaici kewa takaici nadama natsuwa kwanciyar_hankali jin_daɗi tausayi haushi ƙyama'),
    ('describing', 'santsi tauri siriri cikakke jiƙa bushe daddare'),
    ('food, home and the kitchen', 'kayan_abinci abin_sha ɗanɗano ƙamshi wari tsami zaƙi babbar_riga wanki ɗinki labule fenti ɗakin_kwana falo tsakar_gida niƙa daka turmi taɓarya risho'),
    ('numbers and measures', 'biliyan kashi'),
    ('crime and conflict', 'beli ɗauri kisan_kai cin_hanci ɗan_fashi makami bam hari runduna'),
    ('Wiktionary words with a tone line', "ainun alhali albishir alkadari amo annuri aƙida bahasi bahili baitulmali bangaskiya darduma diflomasiyya dimokuraɗiyya diyya dorina eka fartanya filas fitina gurasa gusa hadisi hajji alhaji hakimi hawainiya hijabi hijira hikaya husufi huɗuba idi jidali jimina juwa kabewa kaidi kamfas kanumfari karimi kife kuɓewa kuskus kwalekwale labudda ladan lardi lokaci-lokaci lori magini mahalli makiyaya manzo masaƙi marini mubazzari mulukiya munafuki na'ibi nahawu nim notis obin rake randa rula sababi sadaki salihi samame sandal sannu-sannu sarai satifikat sef shirka sifiri sitampi soso sufana tafarki tantabara tattasai tsokana tulu tunku ulu ungozoma usur wa'azi wasali waziri yis zakka zarto zik ƙadangare ƙamus ƙosai ƙorama ƙuli-ƙuli ɓaure ɗawisu maɗaba'a fi'ili asubahi la'asar magariba alwala buɗa-baki sahur umra sunna farilla raka'a sujjada zikiri almajiri ajami boka maita galadima anini soci amalanke birike adaka abacada makari hangum riɗi acca gwaza dambu kindirmo alfadari mesa Faransanci"),
    ('people and public roles', "shugaban_ƙasa mataimaki mai_gadi ɗan_ƙasa ɗan_takara masani ɗan_majalisa basarake dagaci mai_unguwa mahaifi mahaifiya koci makanike akanta matuƙi mai_zane fursuna ɗan_adam bil'adama"),
    ('government, law and the economy', "ofishin_jakadanci ƙaramar_hukuma mazaɓa kundin_tsarin_mulki haƙƙin_ɗan_adam mulka kaɗa_ƙuri'a lashe kaye rantsar naɗa tsige murabus zartar ƙudiri tallafi agaji bunƙasa arzuta ƙaranci yalwa albarkatu ma'adinai sufuri sadarwa keta mai_laifi kai_ƙara wanda_ake_zargi zuba_jari kayayyaki ƙima musaya dillali rasiti kuɗin_waje"),
    ('conflict', 'harbi harbe fashewa sace ƙwace ɗan_bindiga tawaye ɗan_tawaye juyin_mulki tsagaita_wuta barazana kasada'),
    ('health', "ciwon_suga ciwon_zuciya ciwon_daji hawan_jini zazzaɓin_cizon_sauro kwalara sanƙarau shan_inna kyanda tarin_fuka ƙwayar_cuta ma'aikacin_lafiya maganin_gargajiya mai_ciki zubar_jini suma ƙaiƙayi kurji ƙuna"),
    ('education', "kwaleji makarantar_allo boko nazari littafin_rubutu kuɗin_makaranta haddace kwas malamin_jami'a yare harshen_uwa"),
    ('technology', 'kyamara lasifika janareto maɓalli tauraron_ɗan_adam'),
    ('the environment', 'sare dasa gurɓatar_yanayi kwararowar_hamada zaizayar_ƙasa tsiro gaɓar_teku bakin_teku sararin_samaniya yanayin_zafi'),
    ('the home and daily life', 'kayan_ɗaki buhu leda man_shafawa man_goge_baki kunshi kitso aski rigar_sanyi atamfa yadi leshi safar_hannu ƙarshen_mako ranar_hutu tsakar_rana safiya'),
    ('food', 'awara waina naman_sa kitse man_gyaɗa man_ja kayan_ƙamshi fulawa waken_suya cakulan kek giya taba sigari'),
    ('more verbs', 'auku wanzu kawar rasu jikkata kuɓuta shawo_kan jure haƙura tuba kwaikwaya tuntuɓa watse gaji isa nufi'),
    ('abstract nouns', 'rabo sanadiyya zarafi sarari koma_baya gazawa himma kishin_ƙasa rarrabuwa daidaito rashin_adalci cin_zarafi nuna_bambanci wayewa asali zahiri'),
    ('adverbs and linking words', "da_gaske a_fili a_ɓoye a_kai_a_kai nan_take tun_da_wuri da_farko daga_ƙarshe a_halin_yanzu har_abada ko'ina ko_kaɗan matuƙa har_ma bugu_da_ƙari haka_kuma daga_baya bayan_haka a_cewar saɓanin ƙasa_da tsakanin a_madadin"),
    ('Wiktionary words with a tone line', 'kiyama tafsiri sardauna dogari algaita kaɗanya agushi agade bika fatsa shadda alatu'),
    ('verbs of movement and handling', 'toshe huda girgiza mirgina haura gangara miƙe lanƙwasa karkata waiwaya leƙa duba samo kasa_kunne aike buga_waya'),
    ('verbs of states and changes', 'murmure rame kumbura ƙone ƙona narke daskare jiƙe ruɓe tsage tsinke nutse shaƙe huce sanyaya ɗumama haskaka binne'),
    ('verbs of social life and the mind', 'gaisa rungume sumbata musabaha taya gabatar wakilta fafata kayar doke tunano ƙudurta zaɓi ƙyale mai_da_hankali koyo saba saɓa'),
    ('work', 'aikin_hannu fayil kwafi tuƙuru ƙungiyar_ƙwadago yajin_aiki ƙarin_albashi fansho inshora'),
    ('society, media and the arts', 'zamantakewa talakawa ƙabilanci taken_ƙasa mai_gabatarwa jita-jita labarin_ƙarya kaɗe-kaɗe tatsuniya karin_magana kirari kayan_tarihi gidan_tarihi sassaƙa rini saƙa ƙwallon_raga'),
    ('nature', "ƙwari gizo-gizo jemage mikiya hankaka dabbar_gida garke kututture katako gawayi tagulla dalma lu'u-lu'u"),
    ('the body and health', 'zufa hawaye yawu majina bayan_gida haƙarƙari mafitsara dasashi gashin_baki fatar_ido goshi ƙeya gwiwar_hannu duwawu ƙwauri tafin_ƙafa takardar_magani likitan_haƙori motar_asibiti gaggawa'),
    ('the home', 'siminti bulo magudanar_ruwa makulli ƙararrawa kwan_fitila injin_niƙa injin_ɗinki'),
    ('life, money and documents', 'kayan_masarufi tsadar_rayuwa tashin_farashi ranar_haihuwa auren_dole neman_aure lefe kai_tsaye gaba wajen_gari cikin_gari jajirtacce gogagge sananne zaunanne wucin_gadi lambar_waya katin_shaida rijista tsabar_kuɗi ɗaukaka'),
    ('particles and linking words', 'kenan ashe kuwa har_ila_yau a_takaice irin_wannan wani_abu ba_komai ko_da in_dai da_zarar sakamakon albarkacin kowa_da_kowa wajibi dole yiwuwa mai_yiwuwa'),
    ('travel and meals', 'zirga-zirga matafiyi jakar_tafiya layin_dogo abincin_rana abincin_dare karin_kumallo kayan_zaƙi dafaffe soyayye gasasshe nunanne ruɓaɓɓe girki'),
    ('school and clothes', 'aikin_gida ƙididdiga shugaban_makaranta gajeren_wando hular_kwano kwat taye jakar_hannu agogon_hannu ɗan_kunne abin_wuya'),
    ('feelings and character', 'hasala farin_jini baƙin_jini firgici goyon_baya amincewa galaba amintacce karamci rowa kwaɗayi tsegumi sanyin_hali zafin_rai son_kai'),
    ('household verbs', 'ara ari tsugunna zana rina kurkure matse tace juye gauraya motsa yayyanka baje ɗauki_hoto'),
    ('places in town', 'gidan_marayu gidan_mai kantin_magani babban_kanti gidan_sinima filin_shaƙatawa'),
    ('Wiktionary words with a tone line (2)', 'mesin albaras sadin atone-janar ayari saɗara shifta buroka dodon-koɗi maɗaci'),
    ('numbers, measures and time', "sulusi ɗaruruwa dubbai ɗaya_bayan_ɗaya biyu-biyu murya inuwa siffa ma'auni ɗazu anjima baɗi makon_jiya mako_mai_zuwa"),
    ('tools and the home', 'taki garma lauje kwali matashin_kai zanen_gado'),
    ('more verbs', 'jinjina tafa sa_ido bi_diddigi'),
    ('Wiktionary words with a tone line (3)', 'garwashi bana'),
    ('elections and the state', "rumfar_zaɓe akwatin_zaɓe ofishin_'yan_sanda kotun_ƙoli majalisar_dattawa majalisar_wakilai fadar_shugaban_ƙasa ma'aikatar_lafiya hukumar_zaɓe jam'iyyar_adawa sakamakon_zaɓe yaƙin_neman_zaɓe"),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1}
