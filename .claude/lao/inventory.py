#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Lao has no published graded word list (see `lao_level.py`), so a level's CORE
is written here, a topic at a time, for the scope its CEFR descriptor sets;
`select.py` resolves every word against Wiktionary (a word not found there is
reported and dropped, never given an invented meaning) and tops the level up
with the commonest remaining words.

A word may carry a part of speech after a colon (`ຖືກ:adj`) where the spelling
is shared and the level wants one reading first.  Spellings are Wiktionary's
headwords.

WIKTIONARY'S LAO IS SMALL -- some 2,400 words against Thai's 21,000 -- and it
has NO ENTRY for several words a beginner meets in the first week: ວ່າ "that;
to say", ຍັງ "still, yet", ເອົາ "to take", ຢາກ "to want", ຄິດ "to think",
ເຈັບ "to hurt", ກັບ "with" (its ກັບ is only the verb "to return"), ຖ້າ "if",
ກໍ "then", ນ້ອງ "younger sibling", ເອື້ອຍ "elder sister", ແລງ "evening".
They are not here because they cannot be carded without a meaning written by
hand; `docs/lao-decks-plan.md` §4 keeps the list, so they go in when
Wiktionary gains them (a re-run picks them up).  Words written below that
Wiktionary still lacks are reported by `select.py` and dropped.
"""

A1 = [
    ('pronouns', 'ຂ້ອຍ:pron ຂ້າພະເຈົ້າ ເຈົ້າ:pron ທ່ານ ລາວ:pron ເຂົາ ເຂົາເຈົ້າ ເຮົາ ພວກເຮົາ ມັນ:pron ຕົນເອງ ເພິ່ນ'),
    ('questions', 'ຫຍັງ ໃຜ ໃສ ເປັນຫຍັງ ແນວໃດ ຈັກ:adj'),
    ('greetings and politeness', 'ສະບາຍດີ ຂອບໃຈ ຂໍໂທດ ບໍ່ເປັນຫຍັງ ຍິນດີ ກະລຸນາ ຂໍ:verb ອາໂຫຼ ເຮີຍ ສະບາຍ'),
    ('yes, no and time words', 'ບໍ່ ແມ່ນ ໄດ້ ແລ້ວ ເຄີຍ ກຳລັງ ຈະ ກຳລັງຈະ ຢ່າ:adv'),
    ('prepositions and conjunctions', 'ແລະ ຫຼື ແຕ່ ເພາະ ຍ້ອນ:prep ທີ່ ໃນ ຢູ່ໃນ ເທິງ ກ້ອງ ໜ້າ ຫຼັງ ຂອງ:prep ຈາກ '
     'ໃຫ້ ໃກ້ ໄກ ກ່ອນ ຕໍ່:prep ໂດຍ:prep ຫຼັງຈາກ ເພື່ອ ເມື່ອ ກ່ຽວກັບ ຄັນ:conj'),
    ('numbers', 'ສູນ:num ໜຶ່ງ ສອງ ສາມ ສີ່ ຫ້າ ຫົກ ເຈັດ ແປດ ເກົ້າ ສິບ ຊາວ ເອັດ ຮ້ອຍ ພັນ ໝື່ນ ແສນ ລ້ານ'),
    ('classifiers', 'ຄົນ ໂຕ:classifier ໜ່ວຍ ຫົວ:classifier ຄັນ:classifier ລູກ ຈອກ ຈານ ແກ້ວ ຫຼັງ:classifier '
     'ເຫຼັ້ມ ໃບ ບ່ອນ ຖ້ວຍ'),
    ('time', 'ເວລາ ໂມງ ຊົ່ວໂມງ ນາທີ ວັນ ຄືນ ເຊົ້າ ກາງຄືນ ມື້ນີ້ ມື້ອື່ນ ມື້ວານ ດຽວນີ້ ປັດຈຸບັນ ອາທິດ ເດືອນ ປີ '
     'ໄວ ຊ້າ ບາງເທື່ອ ເລື້ອຍໆ ມື້ ທ່ຽງ'),
    ('days', 'ວັນຈັນ ວັນອັງຄານ ວັນພຸດ ວັນພະຫັດ ວັນສຸກ ວັນເສົາ ວັນອາທິດ'),
    ('months', 'ມັງກອນ:name ກຸມພາ:name ມີນາ:name ເມສາ:name ພຶດສະພາ:name ມິຖຸນາ:name ກໍລະກົດ:name '
     'ສິງຫາ:name ກັນຍາ:name ຕຸລາ:name ພະຈິກ:name ທັນວາ:name'),
    ('family', 'ຄອບຄົວ ພໍ່ ແມ່ ອ້າຍ ລູກ ຜົວ ເມຍ ປູ່ ຕາ ເດັກ ຜູ້ຊາຍ ຜູ້ຍິງ ໝູ່ ເພື່ອນ'),
    ('people and yourself', 'ຊື່ ອາຍຸ ປະເທດ ເມືອງ ພາສາ ວຽກ ຄູ ໝໍ ຄົນ'),
    ('food and drink', 'ອາຫານ ເຂົ້າ ນ້ຳ ຊາ ກາເຟ ນົມ ໝາກໄມ້ ຜັກ ຊີ້ນ ໝູ ໄກ່ ປາ:noun ກຸ້ງ ໄຂ່ ເກືອ:noun ນ້ຳຕານ '
     'ເຜັດ ຫວານ ເຄັມ ສົ້ມ ແຊບ ຂົມ ຫິວ ອີ່ມ ເຝີ ເຂົ້າໜຽວ ລາບ ເບຍ ກິນເຂົ້າ'),
    ('shopping and money', 'ເງິນ ກີບ ລາຄາ ແພງ:adj ຖືກ:adj ຮ້ານ ຕະຫຼາດ ຊື້ ຂາຍ ຈ່າຍ ແລກ'),
    ('the home', 'ເຮືອນ ຫ້ອງ ປະຕູ ປ່ອງຢ້ຽມ ຕຽງ ໂຕະ ຕັ່ງ ຫ້ອງນ້ຳ ໄຟ ໂທລະສັບ ໂທລະທັດ ປຶ້ມ ກະເປົາ ກະແຈ'),
    ('the town and getting about', 'ທາງ ຖະໜົນ ລົດ:noun ລົດເມ ລົດໄຟ ຍົນ ເຮືອ ລົດຖີບ ສະໜາມບິນ ໂຮງແຮມ ໂຮງຮຽນ '
     'ໂຮງໝໍ ທະນາຄານ ວັດ ຂວາ ບ້ານ ນະຄອນ ຮອດ ທ່ຽວ ເດີນທາງ'),
    ('the body and feeling ill', 'ຫົວ:noun ຕາ ຫູ ດັງ:noun ປາກ ແຂ້ວ ມື ຕີນ ແຂນ ຂາ ຢາ ໄຂ້ ໄອ ຈາມ'),
    ('the weather', 'ອາກາດ ຮ້ອນ ໜາວ ເຢັນ ອຸ່ນ ຝົນ ລົມ:noun ຕາເວັນ ເມກ ຟ້າ ໝອກ'),
    ('colours', 'ສີ:noun ແດງ ຂາວ ດຳ ຂຽວ ເຫຼືອງ ບົວ:adj ມ່ວງ:adj'),
    ('everyday verbs', 'ເປັນ ມີ ຢູ່ ໄປ ມາ ກິນ ດື່ມ ນອນ ຕື່ນ ເຮັດ ເວົ້າ ລົມ:verb ຟັງ ເບິ່ງ ເຫັນ ອ່ານ ຂຽນ ຮຽນ ຮູ້ '
     'ເຂົ້າໃຈ ມັກ ຮັກ ຕ້ອງ ສາມາດ ຄວນ ຖາມ ເອີ້ນ ລໍ ນັ່ງ ຢືນ ຍ່າງ ແລ່ນ ຂັບ ຂີ່ ເປີດ ປິດ ຫຼິ້ນ ເຂົ້າ:verb '
     'ຊອກ ຫາ ລືມ ຈື່ ໃຊ້ ສອນ ໄດ້ຍິນ ຫົວ:verb ຍິ້ມ ຊື້ ສົ່ງ ໃສ່ ລ້າງ ອາບ ຕັດ ກັບຄືນ ລອຍນ້ຳ ແຕ້ມ ຝັນ ນັບ'),
    ('everyday adjectives', 'ດີ ໃຫຍ່ ນ້ອຍ ຫຼາຍ ໃໝ່ ເກົ່າ ງາມ ສູງ ຍາວ ສັ້ນ ໜັກ ງ່າຍ ຍາກ ເມື່ອຍ ສະອາດ '
     'ເປື້ອນ ຫວ່າງ ຈິງ ພ້ອມ ກວ້າງ ແຄບ ໜາ ແຫ້ງ ປຽກ ມືດ ສົດ ເກ່ງ ສະຫຼາດ ຄຽດ ເສົ້າ ຕຸ້ຍ ອ່ອນ ດິບ'),
    ('little words', 'ນີ້ ທີ່ນີ້ ທັງໝົດ ທີ່ສຸດ ກວ່າ ແຕ່ລະ ອີກ ເກືອບ ພຽງ ບາງທີ ແນ່ນອນ ຄືກັນ ເລັກນ້ອຍ ເກີນໄປ ຊ້າໆ ໄວໆ'),
]

INVENTORY = {'a1': A1}
