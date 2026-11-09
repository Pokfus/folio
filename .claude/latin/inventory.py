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

INVENTORY = {'a1': A1}
