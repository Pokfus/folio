#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Latin has no published graded word list on the CEFR (see `latin_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found there
is reported and dropped, never given an invented meaning) and tops the level up
with the commonest remaining words of the DCC Latin Core Vocabulary.

THE TOPICS ARE CLASSICAL.  The CEFR's A1 is about ordering coffee and buying a
bus ticket; Latin has no word for either that a Roman wrote.  So each topic is
taken in the vocabulary of Roman life -- the house is `domus`, `iānua` and
`cubiculum`, travel is `via`, `iter` and `nāvis` -- and nothing is admitted
that only Neo-Latin coins.

SPELLINGS CARRY THEIR MACRONS, and the macron DECIDES between homographs:
`mālum` "apple" and `malum` "evil", `ōs` "mouth" and `os` "bone", `edō` "eat"
and `ēdō` "give out", `lūdō` and `lūdus`.  `select.py` keeps the entries whose
Wiktionary headword matches the spelling here exactly, and reports a word it
could match only without the marks.  A part of speech may follow a colon
(`cum:prep`) where one reading should lead.  Classical spelling: `v` for the
consonant (`vīnum`), never `j` (`iam`).
"""

A1 = [
    ('pronouns', 'ego tū nōs vōs is hic ille iste ipse suī meus tuus suus noster vester quī'),
    ('questions', 'quis ubi quandō cūr quōmodo quot quantus quālis unde quō num nōnne'),
    ('prepositions', 'in ad ab ex cum:prep dē sine prō per ante post sub super inter apud '
                     'trāns prope contrā circum propter'),
    ('conjunctions and particles', 'et atque sed aut vel nam enim quia sī nisi ut dum '
                                   'autem igitur itaque ergō quoque etiam nōn nē tamen neque '
                                   'iam ita sīc minimē vērō'),
    ('greetings and politeness', 'salvē valē ave:intj grātia quaesō:intj'),
    ('numbers', 'ūnus duo trēs quattuor quīnque sex septem octō novem decem ūndecim duodecim '
                'vīgintī quīnquāgintā centum mīlle prīmus secundus tertius'),
    ('time', 'tempus hōra diēs nox māne vesper hodiē crās heri nunc mox semper numquam saepe '
             'annus mēnsis tum deinde ōlim diū'),
    ('family', 'familia māter pater frāter soror fīlius fīlia marītus:noun uxor avus avia puer '
               'puella vir fēmina homo īnfāns:noun amīcus:noun parēns līberī'),
    ('people', 'nōmen patria lingua magister discipulus medicus:noun servus:noun dominus rēx rēgīna cīvis '
               'populus hospes nauta agricola mīles'),
    ('food and drink', 'cibus pānis vīnum aqua lac mel carō piscis ōvum mālum cāseus sāl frūctus '
                       'cēna prandium iēntāculum'),
    ('buying and selling', 'pecūnia pretium emō vēndō taberna mercātor cārus vīlis'),
    ('the house', 'domus casa vīlla cubiculum iānua porta fenestra mēnsa sella lectus liber '
                  'culīna hortus mūrus'),
    ('the town and travel', 'urbs oppidum via forum templum schola flūmen pōns ager īnsula iter '
                            'equus nāvis'),
    ('the body and illness', 'corpus caput oculus auris nāsus ōs manus pēs venter dēns '
                             'bracchium capillus aeger dolor febris'),
    ('the sky and the weather', 'caelum sōl lūna stēlla pluvia ventus nix nūbēs frīgidus '
                                'calidus tempestās'),
    ('colours', 'color ruber caeruleus flāvus viridis niger albus'),
    ('animals', 'animal canis fēlēs avis bōs ovis porcus mūs lupus leō'),
    ('describing', 'magnus parvus novus vetus pulcher bonus malus laetus trīstis longus brevis '
                   'facilis difficilis multus paucus omnis nūllus aliquis fortis altus'),
    ('everyday verbs', 'sum possum habeō faciō eō veniō videō audiō dīcō loquor edō bibō dormiō '
                       'legō scrībō intellegō sciō volō nōlō amō ambulō currō sedeō stō labōrō '
                       'habitō dō capiō ferō rogō respondeō exspectō lavō lūdō cantō vocō clāmō '
                       'discō doceō petō quaerō inveniō maneō dūcō mittō pōnō aperiō claudō '
                       'cōgitō putō sentiō timeō rīdeō'),
]

# A2 (2026-11-12): the CEFR's "areas of most immediate relevance" -- personal and family
# information, shopping, local geography, employment -- taken, as A1's were, in the words
# of Roman life.  A word A1 already teaches is skipped by `select.py` in silence.
A2 = [
    ('more numbers', 'trēdecim quattuordecim quīndecim sēdecim septendecim duodēvīgintī '
                     'ūndēvīgintī trīgintā quadrāgintā sexāgintā septuāgintā octōgintā '
                 'nōnāgintā ducentī quārtus quīntus sextus septimus octāvus nōnus decimus '
                 'bis ter semel dīmidius'),
    ('the calendar and the seasons', 'vēr aestās autumnus hiems merīdiēs aurōra hebdomas '
                 'saeculum mātūrus sērō'),
    ('the wider family', 'nepōs neptis avunculus patruus amita mātertera socer gener nurus '
                 'vidua orbus gemellus mātrimōnium nuptiae'),
    ('work and trades', 'faber pistor lanius sūtor tōnsor pāstor piscātor coquus:noun '
                 'ancilla architectus pictor poēta ōrātor iūdex advocātus '
                 'mīles negōtium mercēs officīna operārius'),
    ('the market and money', 'mercātus macellum nummus dēnārius sēstertius as:noun '
                 'aes argentum ēmptor pondus mēnsūra lībra modius pēnsō '
                 'solvō dēbitum lucrum dīves pauper'),
    ('clothing', 'vestis toga tunica stola palla calceus solea ānulus ōrnāmentum '
                 'lāna līnum induō exuō gerō'),
    ('the house and its things', 'ātrium peristȳlum trīclīnium impluvium tēctum pariēs '
                 'pavīmentum gradus clāvis lucerna candēla lectulus '
                 'arca pōculum calix patera ōlla culter cochlear '
                 'speculum lūmen focus'),
    ('meals and the kitchen', 'olīva oleum ūva pirum fīcus faba holus porrum cēpa '
                 'pullus gallīna pōmum puls condiō coquō gustō '
                 'ēsuriō sitiō dulcis acerbus amārus'),
    ('the town', 'aedificium vīcus balneum theātrum amphitheātrum circus '
                 'basilica cūria carcer aquaeductus fōns turris statua platēa angulus '
                 'portus mōnstrō'),
    ('travel and transport', 'carrus currus raeda plaustrum mūlus asinus gubernātor '
                 'vēlum rēmus ancora nāvigō vehō proficīscor iter '
                 'viātor comes sarcina hospitium caupōna dēversōrium'),
    ('the country and the farm', 'rūs vīcīnus campus prātum vīnea seges frūmentum herba '
                 'flōs arbor rāmus folium rādīx sēmen arō serō metō '
                 'pāscō fōns lacus collis vallis lapis'),
    ('animals', 'gallus anas ānser apis musca serpēns vacca taurus capra caper aper '
                 'cervus vulpēs ursus aquila columba passer piscis catulus'),
    ('the body and health', 'collum umerus digitus genu crūs dorsum frōns lingua labrum '
                 'barba cor sanguis vulnerō sānus valeō medicīna '
                 'remedium cūrō doleō'),
    ('school and letters', 'tabula stilus cēra charta '
                 'calamus lūdus:noun paedagōgus grammaticus versus:noun pāgina '
                 'numerō computō exemplum'),
    ('games and leisure', 'pila ālea tālus spectāculum gladiātor ōtium '
                 'voluptās saltō natō spectō iocus fābula'),
    ('feelings and character', 'gaudium laetitia trīstitia timor odium invidia '
                 'spērō gaudeō doleō īrāscor misereor iūcundus molestus '
                 'fessus dēfessus hilaris benignus crūdēlis '
                 'superbus timidus audāx stultus'),
    ('describing', 'lātus angustus altus humilis plēnus vacuus celer tardus lentus '
                 'dūrus mollis siccus ūmidus pūrus sordidus antīquus recēns '
                 'iuvenis senex prīvātus pūblicus vērus aequus similis '
                 'dissimilis proximus ultimus reliquus'),
    ('where and how', 'hīc illīc ibi hūc illūc intus forīs procul ubīque '
                 'circā iuxtā suprā īnfrā extrā intrā ultrā prae ob '
                 'diū paene vix fortāsse prōtinus statim subitō iterum '
                 'interdum rārō bene male celeriter lentē facile'),
    ('everyday verbs', 'surgō cubō iaceō lavō vestiō pectō dormiō vigilō exspectō '
                 'salūtō occurrō conveniō accēdō discēdō abeō exeō ineō '
                 'intrō redeō trānseō ascendō dēscendō adveniō perveniō '
                 'portō ferō trahō iaciō tangō aperiō frangō tegō '
                 'mōnstrō ostendō indicō narrō dēmōnstrō explicō '
                 'iuvō adiuvō servō custōdiō dēfendō vītō fugiō '
                 'pugnō vincō laudō culpō pūniō ignōscō '
                 'cēnō prandeō numerō dēleō errō mālō nesciō '
                 'meminī oblīvīscor recordor taceō sileō fleō '
                 'licet oportet necesse placeō dēsīderō cupiō'),
]

# B1 (2026-11-12): the CEFR's "familiar matters regularly encountered in work, school,
# leisure" -- for a reader of Latin, the matters of the texts one reads first: the state
# and its offices, the courts, the army, the gods, the sea, learning and speaking.
# `sānctus:verb` asks for Wiktionary's participle entry ("holy"), which the DCC's
# "adjective" would otherwise drop in favour of the noun "a saint".
B1 = [
    ('the state and its offices', 'cōnsul senātor magistrātus quaestor aedīlis '
                                  'praetor cēnsor dictātor tribūnus līctor imperium potestās '
                                  'cōnsulātus comitia suffrāgium candidātus factiō '
                                  'patricius plēbēius nōbilitās lēx rogātiō '
                                  'dēcrētum ēdictum colōnia mūnicipium prōvincia tribūtum '
                                  'vectīgal aerārium'),
    ('law and the courts', 'iūs iūdicium iūdex reus accūsātor accūsō dēfendō damnō '
                           'absolvō condemnō testis testimōnium crīmen poena supplicium '
                           'carcer fraus fūrtum fūr latrō caedēs venēnum '
                           'iniūria arbitrium sententia causa quaestiō'),
    ('the army and war', 'exercitus legiō cohors centuriō:noun manipulus ēques pedes '
                         'equitātus peditātus imperātor lēgātus mīles tīrō signum '
                         'aquila castra vallum fossa mūnītiō agger turris obsidiō '
                         'oppugnō expugnō obsideō circumdō aciēs proelium pugna '
                         'victōria clādēs fuga triumphus praeda captīvus obses '
                         'indūtiae pāx foedus socius hostis arma scūtum gladius hasta '
                         'pīlum sagitta arcus galea lōrīca tuba stīpendium '
                         'impedīmentum agmen iter'),
    ('the gods and religion', 'deus dea dīvus nūmen templum āra sacrificium victima '
                              'sacerdōs pontifex augur auspicium ōmen ōrāculum vātēs '
                              'vōtum religiō pietās superstitiō fēstus '
                              'immortālis dīvīnus sacer sānctus:verb profānus '
                              'sacrificō immolō veneror adōrō'),
    ('the sea and ships', 'mare pontus pelagus ōceanus unda flūctus aestus lītus ōra '
                          'portus nāvis ratis puppis prōra carīna mālus:noun gubernāculum '
                          'nauta classis nāvigātiō naufragium tempestās scopulus '
                          'nāvigō appellō solvō'),
    ('land and geography', 'regiō terra orbis continēns īnsula paenīnsula fīnis '
                           'fīnitimus mōns iugum saltus silva lūcus campus palūs '
                           'harēna dēsertum vallis rīpa fōns ōstium cursus '
                           'septentriōnēs merīdiēs oriēns occidēns'),
    ('learning, speaking and writing', 'disciplīna doctrīna scientia ars studium '
                                       'philosophia philosophus rhētor ēloquentia '
                                       'ōrātiō ōrātor dīcō disserō disputō '
                                       'loquor ēloquor persuādeō suādeō moneō '
                                       'liber volūmen historia poēma carmen '
                                       'versus fābula auctor scrīptor lēctor '
                                       'sermō verbum vōx sententia argūmentum ratiō'),
    ('building and the arts', 'aedificō exstruō mūniō monumentum sepulcrum '
                              'columna arcus marmor lapis saxum later '
                              'imāgō statua signum pictūra sculpō pingō '
                              'mūsica cantus tībia lyra cithara chorus saltātiō '
                              'scaena histriō spectātor'),
    ('trade, wealth and work', 'mercātūra commercium negōtior mercor quaestus '
                               'dīvitiae inopia egestās paupertās cōpia '
                               'pretium cārus vīlis faenus ūsūra '
                               'possideō possessiō hērēs hērēditās testāmentum '
                               'fundus praedium colōnus vīlicus agricultūra'),
    ('society and the household', 'gēns familia patrōnus cliēns lībertīnus servitūs '
                                  'lībertās dominus ancilla verna nūtrīx '
                                  'mātrōna coniugium nūbō dūcō dīvortium '
                                  'cognātus propinquus affīnis hospes hospitium '
                                  'amīcitia inimīcus aemulus'),
    ('nature and the elements', 'nātūra elementum āēr aethēr ignis flamma '
                                'fulmen tonitrus imber grandō glaciēs pruīna '
                                'frīgus calor aestus lūx tenebrae umbra '
                                'metallum ferrum aurum argentum aes plumbum '
                                'gemma lignum'),
    ('time and history', 'aetās aevum saeculum memoria posteritās orīgō initium '
                         'senectūs exitus ēventus cāsus fortūna fātum antīquitās '
                         'vetustās nūper ōlim quondam anteā posteā '
                         'interim intereā tandem dēmum dēnique cotīdiē '
                         'quotannīs perpetuō'),
    ('mind, feeling and character', 'mēns animus ingenium memoria cōnsilium '
                                    'cōgitātiō opīniō spēs metus pavor formīdō:noun '
                                    'terror audācia cōnstantia prūdentia '
                                    'temperantia fortitūdō iūstitia clēmentia '
                                    'fidēs perfidia avāritia ambitiō superbia '
                                    'modestia verēcundia pudor dignitās '
                                    'glōria laus fāma īnfāmia invidia odium '
                                    'amor cupiditās libīdō voluptās dolor '
                                    'lūctus maeror misericordia'),
    ('describing', 'ingēns immēnsus exiguus angustus amplus '
                   'clārus obscūrus illūstris īnsignis nōbilis ignōbilis '
                   'dīligēns neglegēns industrius iners '
                   'prūdēns imprūdēns sapiēns īnsipiēns '
                   'cupidus avidus contentus '
                   'pius impius probus improbus honestus turpis '
                   'certus incertus dubius manifestus apertus occultus '
                   'necessārius ūtilis inūtilis idōneus aptus '
                   'praecipuus singulāris commūnis prīvātus pūblicus '
                   'perpetuus aeternus subitus repentīnus'),
    ('connecting and relating', 'postquam priusquam antequam quamquam etsī etiamsī '
                                'quamvīs cum:conj ubi dōnec quoad '
                                'quoniam quandoquidem proptereā ideō itaque '
                                'proinde quārē quōcircā praetereā dēnique '
                                'tamen attamen nihilōminus vērum quidem equidem '
                                'scīlicet nempe vidēlicet immō'),
    ('verbs of the mind and of speech', 'arbitror exīstimō cēnseō iūdicō '
                                        'cōnsīderō dēlīberō dubitō cōnfīdō '
                                        'spērō dēspērō meminī recordor '
                                        'oblīvīscor ignōrō cognōscō comperiō '
                                        'intellegō percipiō sentiō '
                                        'affirmō negō nūntiō referō narrō '
                                        'polliceor prōmittō iūrō minor:verb '
                                        'hortor cohortor moneō admoneō '
                                        'postulō flāgitō ōrō obsecrō '
                                        'concēdō permittō vetō prohibeō '
                                        'laudō vituperō reprehendō accūsō'),
    ('verbs of doing', 'cōnor cūrō efficiō perficiō cōnficiō '
                       'parō comparō īnstruō ōrnō '
                       'servō cōnservō tueor dēfendō prōtegō '
                       'augeō minuō crēscō mūtō '
                       'trādō dēdō reddō restituō tribuō '
                       'regō gubernō administrō '
                       'vincō superō opprimō dēleō '
                       'ēdūcō indūcō redūcō trādūcō '
                       'ēmittō dīmittō remittō '
                       'cōgō compellō impellō '
                       'iungō coniungō sēiungō '
                       'ūtor fruor fungor potior'),
]

INVENTORY = {'a1': A1, 'a2': A2, 'b1': B1}
