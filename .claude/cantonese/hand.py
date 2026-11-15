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
    '可': 'a bound form ("-able"), never a word on its own in speech',
    '哋': "the plural suffix of 我哋 / 你哋 / 佢哋, all three taught; alone, HKCanCor has only a rare dei2",
    '喀': "HKCanCor's hesitation haak6 (696 tokens, tagged e); the dictionaries' 喀 is another word, 'to vomit'",
}
