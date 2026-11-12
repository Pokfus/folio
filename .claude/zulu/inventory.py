#!/usr/bin/env python3
"""The hand-written topic inventory of each Zulu level.

Each level is a list of (topic, words): space-separated headwords as English
Wiktionary files them (a verb, an adjective or a relative by its STEM without
the hyphen: `hamba`, `khulu`, `bomvu`), `_` for a space, and `:pos` where the
word has entries of several parts of speech and only one is meant.  A word not
in Wiktionary is reported by select.py and dropped -- never invented.

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`zulu_level.SCOPE`).  Every word below
was looked up in the extract before it was written here.  What A1 would have
and the source does NOT, so the deck cannot teach it (2026-11-09): kodwa "but",
namuhla "today", ukuthi "that", nini "when", kuphi "where", kungani "why",
kancane "slowly", eduze "near", ekuseni "in the morning", iviki "week" (isonto
serves), uthisha "teacher" (umfundisi serves).

A2 IS SCOPED TO THE CEFR A2 DESCRIPTOR, looked up the same way (2026-11-12).
The months English Wiktionary has not got: u-Ephreli, u-Agasti, u-Okthoba (the
deck teaches nine of the twelve).  Nor these, which A2 would have: izicathulo
(isicathulo serves), isiketi "skirt", ibhande "belt", uthisha "teacher",
umshayeli "driver", isiguli "patient", ibhange "bank", imakethe "market",
isiteshi "station", itekisi "taxi", iwashi "watch", umbuzo "question",
iyunivesithi "university", ikhofi "coffee", isipuni "spoon", ingilazi "glass",
inkomishi "cup", ekuseni "in the morning", kusihlwa "in the evening", bonke /
wonke "all", kodwa "but".  `impela` (filed as "truth", not "really") and `jika`
(filed as "to hang", not "to turn") are left out for their glosses.
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'sawubona sanibonani yebo cha uxolo cela bonga sala hamba:verb'),
        ('pronouns and pointing words',
         'mina wena yena thina nina bona:pron lo:pron le:pron lokhu lokho lapha lapho:adv khona:adv '
         'konke'),
        ('question words',
         'ubani ni:adj phi kanjani njani malini'),
        ('people and the family',
         'umuntu indoda umfazi owesifazane umfana intombazane ingane umntwana umama ubaba '
         'ugogo umkhulu umzali umyeni inkosikazi ubhuti udade umfowethu indodana indodakazi '
         'umndeni umngane isihlobo'),
        ('numbers',
         'nye:adj bili thathu ne:adj hlanu isithupha isikhombisa isishiyagalombili '
         'isishiyagalolunye ishumi ikhulu:noun inkulungwane inombolo'),
        ('time and the calendar',
         'isikhathi ihora umzuzu usuku ubusuku isonto inyanga unyaka manje njalo kusasa izolo '
         'uMsombuluko uLwesibili uLwesithathu uLwesine uLwesihlanu uMgqibelo'),
        ('food and drink',
         'ukudla amanzi isinkwa inyama ubisi itiye ushukela usawoti iqanda isithelo ubhanana '
         'ilayisi utshwala inkukhu inhlanzi imifino dla phuza pheka lamba oma:verb'),
        ('money and shopping',
         'imali isitolo thenga thengisa intengo khokha'),
        ('the home',
         'indlu ikhaya igumbi umnyango ifasitela itafula isihlalo umbhede ikhishi'),
        ('the town and getting about',
         'idolobha umuzi umgwaqo imoto ibhasi isitimela ibhayisikili isikole isibhedlela '
         'ihhovisi izwe indawo'),
        ('the body and feeling ill',
         'umzimba ikhanda iso isandla unyawo umlomo indlebe ikhala izinyo inhliziyo isisu igazi '
         'gula udokotela umuthi ubuhlungu'),
        ('the weather',
         'izulu ilanga imvula umoya amakhaza ukushisa banda'),
        ('colours',
         'bomvu luhlaza mnyama mhlophe mpunga nsundu'),
        ('describing things',
         'khulu ncane de fushane hle bi sha dala ningi mbalwa'),
        ('animals',
         'inja ikati inkomo imbuzi ihhashi inyoni isilwane'),
        ('school and work',
         'umsebenzi incwadi iphepha umfundisi umfundi ulimi isiZulu ucingo'),
        ('everyday verbs',
         'buya fika phuma ngena hlala ma lala vuka sebenza funda bhala khuluma lalela bona:verb '
         'bheka thanda funa dinga azi khumbula khohlwa cabanga thola nika thatha letha vula vala '
         'hleka khala dlala cula gijima geza gqoka sukuma biza siza buza phendula qala qeda '
         'linda vuma enza ba:verb thi'),
        ('joining words and place words',
         'futhi noma ngoba uma kanye kakhulu kahle kude phezulu phansi phambili ngaphandle'),
    ],
    'a2': [
        ('the months and the seasons',
         'ujanuwari ufebruwari umashi umeyi ujuni ujulayi usepthemba unovemba udisemba '
         'ihlobo ubusika intwasahlobo ikwindla'),
        ('the points of the compass, languages and peoples',
         'inyakatho iningizimu impumalanga intshonalanga isingisi isibhunu isixhosa umzulu ingisi'),
        ('clothes',
         'ihembe ibhulukwe isicathulo isigqoko ijazi'),
        ('work and jobs',
         'isisebenzi umlimi umakhi unesi umhleli iholide ikhefu isikweletu'),
        ('relatives and neighbours',
         'umzukulu umalume ubabekazi umkhwenyana umfelokazi umakhelwane'),
        ('feelings',
         'jabula dabuka thukuthela esaba khathala ithemba'),
        ('travel and the address',
         'uhambo ihhotela ithikithi ibhanoyi isikebhe ipulazi ikheli vakashela shayela gibela ndiza'),
        ('the weather and the countryside',
         'iqhwa ifu isiphepho ihlathi utshani imbali'),
        ('the body and health',
         'umlenze umunwe unwele intamo idolo khwehlela phola'),
        ('more food and the kitchen',
         'isidlo ikhekhe ushizi ibhotela utamatisi iklabishi ithanga ummbila iwayini ubhiya '
         'ummese imfologo ibhodwe mnandi'),
        ('the home and things',
         'udonga ingadi isikhwama ibhokisi isipho ikhompyutha umakhalekhukhwini iselula'),
        ('talking and telling',
         'tshela xoxa bingelela xolisa impendulo amanga'),
        ('telling when',
         'namhlanje ngomuso'),
        ('plans, problems and opinions',
         'injongo icebo isixazululo ngcono ubuhle'),
        ('everyday verbs of doing',
         'bhukuda hlanza thumela lahla lungisa vimba nqaba dula guga fa'),
        ('big numbers',
         'isigidigidi'),
    ],
}
