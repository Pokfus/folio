#!/usr/bin/env python3
"""What the dictionaries cannot give, written by hand -- each line with its reason.

HAND: an inventory word that neither CC-CEDICT (joined to its Cantonese readings) nor CC-Canto holds.
Its Jyutping is HKCanCor's -- the corpus's transcribers wrote it down, so it is a source, not a guess
-- and its English is Folio's own, the plain everyday meaning every primer gives.  A word not in
HKCanCor either is not carded.

EXCLUDE: a word the frequency fill must not take, with the reason.
"""

HAND = {
    # 攰 "tired": HKCanCor writes it gui6 (6 tokens, tagged a).  Neither dictionary has the character.
    '攰': {'j': 'gui6', 'pos': 'adjective', 'g': ['tired', 'worn out']},
    # 晒 saai3 "all, completely" after a verb (食晒 "eat it all up"): HKCanCor 239 tokens, saai3.
    # CC-CEDICT has the character only as a variant of 曬 "to dry in the sun"; CC-Canto not at all.
    '晒': {'j': 'saai3', 'pos': 'particle', 'g': ['all; completely (after a verb: 食晒 eat it all up)']},
    # 早晨 is THE Cantonese "good morning".  CC-CEDICT has only Mandarin's "early morning", and CC-Canto
    # does not list the word; the greeting is every primer's first lesson.  HKCanCor: zou2 san4.
    '早晨': {'j': 'zou2 san4', 'pos': 'expression', 'g': ['good morning (the greeting)', 'early morning']},
    # 緊 gan2 after a verb marks an action going on (食緊飯 "eating").  CC-Canto has the sense, but split
    # across three glosses and misspelt ("placed afte a verb to indicate an ongoing / continuous /
    # non-stopping action"); the other senses are CC-CEDICT's.  HKCanCor: gan2, tagged u 118 times.
    '緊': {'j': 'gan2', 'pos': 'particle', 'g': ['(after a verb) -ing: the action is going on', 'tight', 'urgent']},
}

EXCLUDE = {
    '俾': "Hong Kong's everyday spelling of 畀 bei2 'to give' (taught at A1), which both dictionaries gloss with the literary 'to cause' first",
    # A2's fill (HKCanCor's ranking): surnames the corpus's speakers name people by, whose dictionary
    # entries would teach another sense (陳 "to lay out", 黃 "yellow", taught as 黃色)
    '陳': 'a surname in HKCanCor', '李': 'a surname in HKCanCor', '黃': 'a surname in HKCanCor',
    '郭': 'a surname in HKCanCor', '黎': 'a surname in HKCanCor',
    '亞視': 'a television station (ATV), a name',
    # numbers built from numbers already taught
    '一百': 'a number built of 一 and 百', '二十': 'a number built of 二 and 十', '三十': 'a number built of 三 and 十',
    '十五': 'a number built of 十 and 五', '三千': 'a number built of 三 and 千',
    # hesitations and noises HKCanCor does not tag mostly as interjections
    '嗯': 'a hesitation', '呵': 'a hesitation', '呃': 'a hesitation', '嘿': 'a hesitation',
    '哩': "HKCanCor's lei5 is a particle; the dictionaries' 哩 is 'mile'",
    # taken out of A1's inventory for a doubtful sense; the fill must not bring them back
    '嘅話': "CC-Canto's only gloss is 'as said'; it is a clause-final 'if'",
    '阿媽': "CC-CEDICT's sense is Taiwanese 'grandma'",
    '隊': "HKCanCor's deoi2 is the slang 'to eat or drink greedily'; the dictionaries' first senses are 'to attack; to stab'",
    '英': 'a bound form (英文, 英國, both taught); its glosses are country names',
    '可': 'a bound form ("-able"), never a word on its own in speech',
    '哋': "the plural suffix of 我哋 / 你哋 / 佢哋, all three taught; alone, HKCanCor has only a rare dei2",
    '喀': "HKCanCor's hesitation haak6 (696 tokens, tagged e); the dictionaries' 喀 is another word, 'to vomit'",
}
