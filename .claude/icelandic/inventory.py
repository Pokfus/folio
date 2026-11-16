#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Icelandic word list was found published (see `icelandic_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found there is
reported and dropped, never invented a meaning) and tops the level up with the
commonest remaining words.  The Norwegian A1 inventory's topics, in Icelandic.

A word may carry a part of speech after a colon (`við:pron`) where the spelling
is shared and the level wants one reading first.  An underscore joins a multi-word
entry (`góðan_daginn`).  Spellings are Wiktionary's Icelandic headwords: a verb by
its infinitive (`fara`; the modals `skulu`, `munu`, `mega`), a noun in the
nominative singular, an adjective in its masculine nominative (`stór`, `góður`),
an ordinal likewise (`fyrstur`).
"""

A1 = [
    ('pronouns', 'ég þú hann hún það:pron við:pron þið þeir þær þau mig þig sig '
                 'minn þinn hans hennar okkar ykkar þeirra sinn'),
    ('questions', 'hvað hver hvar hvenær hvernig hvaða hvert hvaðan'),
    ('prepositions and place words', 'í á:prep til frá með:prep án fyrir:prep af:prep um:prep '
                                     'undir yfir:prep eftir:prep hjá úr við:prep milli '
                                     'hér þar hérna þarna heim heima úti inni upp niður '
                                     'nálægt'),
    ('conjunctions and little words', 'og eða en:conj að:conj sem þegar því ekki já nei jú líka:adv '
                                      'bara mikið lítið kannski alltaf aldrei oft stundum '
                                      'nú núna þá bráðum aftur strax mjög'),
    ('greetings and politeness', 'halló hæ bless takk takk_fyrir gjörðu_svo_vel fyrirgefðu '
                                 'afsakið góðan_daginn góða_nótt velkominn'),
    ('numbers', 'núll einn tveir þrír fjórir fimm sex sjö átta níu tíu ellefu tólf tuttugu '
                'þrjátíu fimmtíu hundrað þúsund fyrstur annar þriðji hálfur'),
    ('time', 'tími klukkutími mínúta dagur nótt morgunn kvöld eftirmiðdagur í_dag á_morgun '
             'í_gær vika mánuður ár klukka snemma seinn'),
    ('days', 'sunnudagur mánudagur þriðjudagur miðvikudagur fimmtudagur föstudagur laugardagur'),
    ('months', 'janúar febrúar mars apríl maí júní júlí ágúst september október nóvember '
               'desember'),
    ('family', 'fjölskylda mamma pabbi móðir faðir bróðir systir sonur dóttir kona maður:noun '
               'barn strákur stelpa amma afi vinur vinkona eiginmaður eiginkona'),
    ('people and yourself', 'nafn aldur land borg bær tungumál íslenska enska starf '
                            'nemandi kennari læknir manneskja'),
    ('food and drink', 'matur vatn kaffi te mjólk brauð vín bjór ostur kjöt fiskur egg ávöxtur '
                       'epli appelsína tómatur salat sykur salt morgunmatur hádegismatur '
                       'kvöldmatur kartafla hrísgrjón smjör ís:noun súpa'),
    ('shopping and money', 'peningur króna verð búð kaupa selja borga kosta ódýr dýr:adj'),
    ('the home', 'hús íbúð herbergi dyr gluggi borð stóll rúm eldhús baðherbergi klósett bók '
                 'penni sími lykill'),
    ('the town and getting about', 'gata vegur bíll strætó lest leigubíll miði stöð hótel '
                                   'sjúkrahús skóli skrifstofa banki hægri vinstri beint '
                                   'flugvöllur sjór veitingastaður apótek hjól'),
    ('the body and feeling ill', 'höfuð auga eyra nef munnur hönd handleggur fótur magi tönn '
                                 'veikur hraustur lyf hiti verkur'),
    ('weather', 'veður hlýr kaldur rigning sól vindur snjór rigna heitur'),
    ('colours', 'litur rauður blár gulur grænn svartur hvítur brúnn'),
    ('describing', 'stór lítill nýr gamall ungur fínn góður vondur glaður leiður langur stuttur '
                   'auðveldur erfiður margur allur heill ekkert þreyttur svangur fallegur'),
    ('everyday verbs', 'vera hafa gera fara koma borða drekka sofa vakna sitja sjá heyra tala:verb '
                       'segja lesa skrifa skilja vita kunna vilja skulu munu mega fá búa heita '
                       'opna:verb loka:verb spyrja svara hugsa elska:verb vinna:verb læra hlusta taka '
                       'gefa keyra ferðast hjálpa finna þurfa geta eiga'),
]

A2 = [
    ('seasons and dates', 'árstíð vor:noun sumar haust vetur helgi frí jól páskar afmæli dagatal '
                          'dagsetning sekúnda'),
    ('more numbers', 'þrettán fjórtán fimmtán sextán sautján átján nítján fjörutíu sextíu sjötíu '
                     'áttatíu níutíu milljón fjórði fimmti tvöfaldur'),
    ('the land and nature', 'náttúra skógur fjall stöðuvatn fljót strönd eyja tré blóm gras steinn '
                            'himinn stjarna tungl jörð sveit garður fjörður jökull eldfjall foss'),
    ('weather', 'ský skýjaður blása stormur gráða kuldi þoka þruma blautur þurr'),
    ('animals', 'dýr:noun hundur köttur hestur kýr svín kind fugl mús kanína björn refur hæna '
                'hvalur'),
    ('clothes', 'föt peysa buxur pils kjóll skyrta jakki frakki húfa skór sokkur hattur taska '
                'hanski gleraugu stærð klæða'),
    ('the home and the kitchen', 'veggur gólf þak stigi sófi lampi skápur hilla teppi eldavél '
                                 'ísskápur ofn diskur bolli glas hnífur gaffall pottur þvo leigja '
                                 'nágranni'),
    ('food and cooking', 'grænmeti gulrót laukur kjúklingur pylsa skinka gúrka banani jarðarber '
                         'kaka safi nammi sósa pipar olía hveiti samloka elda steikja baka:verb '
                         'sætur súr'),
    ('work and jobs', 'yfirmaður fyrirtæki laun hjúkrunarfræðingur bóndi kokkur '
                      'verkfræðingur atvinnulaus umsókn'),
    ('school and learning', 'bekkur heimavinna námskeið háskóli svar orð setning æfing einkunn '
                            'pappír tölva stærðfræði'),
    ('travel and transport', 'ferð bátur skip stoppistöð vegabréf ferðataska kort ferðamaður '
                             'útland brottför lenda flug flugvél'),
    ('the town', 'miðbær torg kirkja safn bókasafn bíó leikhús pósthús lögreglustöð bensínstöð '
                 'bílastæði horn brú gatnamót hverfi'),
    ('health', 'líkami hjarta háls fingur hné blóð tannlæknir lyfseðill kvef hósti sársauki hvíla '
               'meiða'),
    ('feelings', 'tilfinning reiður stressaður hamingjusamur hræddur ótti ást hlæja '
                 'gráta sakna hata undrandi'),
    ('free time', 'skemmtun íþrótt fótbolti leikur tónlist kvikmynd ljósmynd list spil synda dansa '
                  'syngja mála æfa veiða gönguferð'),
    ('everyday verbs', 'bera snúa tapa velja ákveða lána breyta:verb útskýra lýsa panta klifra vona '
                       'reikna mæta'),
    ('describing things and people', 'lágur breiður mjór þykkur þunnur þungur mjúkur harður '
                                     'fljótur hægur hreinn skítugur ljótur skemmtilegur '
                                     'leiðinlegur áhugasamur áhugi venjulegur skrýtinn einfaldur '
                                     'dimmur bjartur fullur tómur opinn vingjarnlegur'),
    ('time words', 'sjaldan seinna nýlega meðan ennþá daglega næstum'),
    ('connectors', 'þess_vegna þó samt auk_þess hvorki'),
]
# The levels above A2 are written one per session, on request (the plan, §5).
B1 = []
B2 = []
C1 = []

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1, 'b2': B2, 'c1': C1}
