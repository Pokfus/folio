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

INVENTORY = {'a1': A1, 'a2': A2}
