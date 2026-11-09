#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Irish has no published graded word list (see `irish_level.py`), so a level's
CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found
there is reported and dropped, never given a meaning from anywhere else) and
tops the level up with the commonest remaining words.

Spellings are the Official Standard's (An Caighdeán Oifigiúil), as Wiktionary's
headwords are; a verb is cited, as Irish dictionaries cite it, by its
second-person singular imperative (`déan` "do!", `ceannaigh` "buy!").  A word
may carry a part of speech after a colon (`sé:pron`) where the spelling is
shared and the level wants one reading first.  `_` joins a multi-word entry.

LEFT OUT, each for a reason found on reading the cards: `na` (the plural article
is a FORM of `an` in Wiktionary, an entry of its own only as a nonstandard
spelling of `ina`), `taitin` (wanted for `taitníonn sé liom` "I like it", but
Wiktionary's only gloss is "to shine", and a card may not teach a meaning its
source does not give).
"""

A1 = [
    ('pronouns and possessives', 'mé tú sé:pron sí muid sibh siad é í iad mo do ár bhur féin'),
    ('questions', 'cad céard cé cén cá conas cathain cén_fáth cé_mhéad'),
    ('prepositions', 'ag ar le do:prep de i ó faoi as chuig roimh trí:prep gan idir go:prep'),
    ('articles, particles and conjunctions', 'an is agus nó ach má mar nuair go:conj nach ní:particle'),
    ('greetings and politeness', 'dia_duit dia_is_muire_duit slán:intj fáilte go_raibh_maith_agat '
                                 'le_do_thoil gabh_mo_leithscéal tá_brón_orm oíche_mhaith'),
    ('numbers', 'aon dó trí:num ceathair cúig sé:num seacht ocht naoi deich fiche caoga céad míle '
                'beirt triúr dara'),
    ('time', 'am uair lá oíche maidin tráthnóna inniu inné amárach anois seachtain mí bliain '
             'nóiméad déanach i_gcónaí riamh go_luath'),
    ('days and seasons', 'Dé_Luain Dé_Máirt Dé_Céadaoin Déardaoin Dé_hAoine Dé_Sathairn '
                         'Dé_Domhnaigh deireadh_seachtaine earrach samhradh fómhar geimhreadh'),
    ('family', 'teaghlach máthair athair deartháir deirfiúr mac iníon fear_céile bean_chéile '
               'seanmháthair seanathair uncail aintín páiste leanbh buachaill cailín fear bean '
               'cara duine'),
    ('people and yourself', 'ainm aois tír cathair baile teanga Gaeilge Béarla obair '
                            'mac_léinn múinteoir dochtúir Éire Éireannach'),
    ('food and drink', 'bia uisce tae bainne caife arán im cáis feoil iasc ubh úll práta '
                       'glasra toradh siúcra salann bricfeasta dinnéar lón'),
    ('shopping and money', 'airgead euro praghas siopa saor daor ceannaigh díol íoc'),
    ('the home', 'teach seomra doras fuinneog bord cathaoir leaba cistin leabhar peann fón eochair'),
    ('the town and getting about', 'sráid bóthar carr bus traein ticéad stáisiún óstán '
                                   'ospidéal scoil oifig banc deas:adj clé díreach gar'),
    ('the body and feeling ill', 'ceann súil cluas srón béal lámh cos bolg fiacail tinn pian '
                                 'cógas'),
    ('weather', 'aimsir grian báisteach gaoth fuar te tirim fliuch sneachta'),
    ('colours', 'dath dearg gorm buí glas dubh bán donn'),
    ('describing', 'mór beag nua sean álainn olc:adj maith sásta ard fada gearr éasca deacair '
                   'go_leor gach rud éigin'),
    ('where', 'anseo ansin thall thuas thíos istigh amuigh isteach amach abhaile freisin fós'),
    ('everyday verbs', 'bí déan téigh tar ith ól codail éirigh suigh féach éist labhair abair '
                       'léigh scríobh tuig faigh tabhair feic clois cuir oscail dún fiafraigh '
                       'inis fan siúil rith imir oibrigh foghlaim cónaigh'),
]

INVENTORY = {'a1': A1}
