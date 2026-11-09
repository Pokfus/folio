#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No published graded Swahili word list exists to reuse (see `swahili_level.py`),
so a level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never given an invented meaning) and tops
the level up with the commonest remaining words.

SPELLINGS ARE WIKTIONARY'S HEADWORDS: a verb is its STEM (`soma`, `la`, `nywa`;
the card prints the infinitive, `kusoma`), an adjective its stem without the
hyphen (`zuri`; the card prints `-zuri` and its agreeing forms).  A word may
carry a part of speech after a colon (`jua:verb`) where the spelling is shared
and the level wants one reading first.  An underscore is a space.
"""

A1 = [
    ('pronouns', 'mimi wewe yeye sisi ninyi wao angu ako ake etu enu ao hii hiyo le'),
    ('questions', 'nini nani:pron wapi lini kwani vipi gani ngapi je'),
    ('little words', 'na kwa katika kwenye ndiyo hapana lakini au kama kwamba pia tu sana '
                     'hata kila bado tena pamoja ila'),
    ('places and directions', 'hapa huko juu chini ndani nje mbele nyuma karibu:adv mbali '
                              'kulia kushoto'),
    ('greetings and politeness', 'jambo habari shikamoo marahaba asante karibu:intj samahani '
                                 'tafadhali kwa_heri salama nzuri:intj poa sawa pole hodi'),
    ('numbers', 'moja mbili tatu nne tano sita saba nane tisa kumi ishirini hamsini mia elfu '
                'nusu kwanza pili'),
    ('time', 'saa dakika siku usiku asubuhi jioni mchana leo kesho jana sasa wiki mwezi mwaka '
             'mapema baadaye wakati'),
    ('days', 'jumatatu jumanne jumatano alhamisi ijumaa jumamosi jumapili'),
    ('family', 'familia mama baba kaka dada ndugu mtoto mwana mume mke bibi babu mvulana '
               'msichana mwanamume mwanamke rafiki'),
    ('people and yourself', 'jina umri nchi mji kijiji lugha kiswahili kiingereza kazi '
                            'mwanafunzi mwalimu daktari mtu'),
    ('food and drink', 'chakula maji chai kahawa maziwa mkate wali chumvi sukari nyama samaki '
                       'tunda ndizi embe yai mboga ugali chungwa'),
    ('shopping and money', 'pesa shilingi bei duka soko rahisi ghali nunua uza lipa'),
    ('the home', 'nyumba chumba mlango dirisha meza kiti kitanda jiko choo kitabu kalamu simu '
                 'ufunguo'),
    ('the town and getting about', 'barabara njia gari basi treni tiketi hoteli hospitali '
                                   'shule ofisi benki'),
    ('the body and feeling ill', 'kichwa jicho sikio pua mdomo mkono mguu tumbo jino '
                                 'mgonjwa ugonjwa maumivu dawa homa umwa'),
    ('weather', 'mvua upepo baridi joto'),
    ('colours', 'rangi ekundu eusi eupe kijani njano'),
    ('describing', 'kubwa dogo zuri baya pya zee refu fupi ingi kidogo gumu furaha safi'),
    ('everyday verbs', 'wa la nywa enda ja soma andika sema ongea sikia ona jua:verb taka '
                       'penda fanya weza kaa lala amka keti simama rudi fika toka:verb ingia '
                       'saidia uliza jibu:verb elewa pika osha cheza pata leta pa chukua tafuta '
                       'anza maliza kumbuka sahau tembea subiri ishi fungua funga wa_na'),
]

INVENTORY = {'a1': A1}
