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

INVENTORY = {'a1': A1}
