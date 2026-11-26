"""Small Urdu helpers shared by every stage of `.claude/urdu/`.

THE FOLD.  Urdu spelling varies in ways a dictionary and a corpus do not agree
on, and a match that ignores them loses words:
  · the SHORT-VOWEL MARKS (zabar, zer, pesh), tashdid and jazm are written in a
    dictionary's headword and tables (`کِتَابیں`) and almost never in running
    text (`کتابیں`);
  · text typed on an ARABIC keyboard uses the Arabic yeh, kaf and heh
    (`ي ك ه`) where Urdu has its own letters (`ی ک ہ`);
  · the izafat heh (`ۂ`) is also written as a plain heh, and a tatweel or a
    zero-width joiner may sit inside a word.
So `fold()` composes (NFC), drops the marks, writes the Arabic letters as the
Urdu ones and drops tatweel and the joiners.  It does NOT decompose: `ئ`, `ؤ`
and `آ` are letters of their own, and NFD would turn `ئ` into a yeh plus a mark.
The fold is for MATCHING only: what a card prints is `plain()`, the dictionary's
spelling without its vowel marks, which is how Urdu is written.
"""
import re, unicodedata

# fathatan .. sukun, the small marks after it, superscript alef, and the
# small high/low marks of U+06D6-06ED -- vowel and reading signs, never letters
MARKS = re.compile('[ً-ٰٟۖ-ۜ۟-۪ۨ-ۭ]')
# what a card PRINTS keeps tanween (`فوراً` is written so) and the superscript
# alef; it drops only the short vowels, tashdid and jazm
SHORT = re.compile('[َ-ْٕٖ]')
SWAP = str.maketrans({'ي': 'ی', 'ى': 'ی', 'ك': 'ک',
                      'ه': 'ہ', 'ۀ': 'ہ', 'ۂ': 'ہ',
                      'ـ': None, '‌': None, '‍': None, '‏': None,
                      '‎': None})

ARAB = re.compile('[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]')
# a WORD: Arabic-script letters and marks, not punctuation (، ؛ ؟ ۔) or digits
WORD = re.compile('[ء-ٰٟ-ۓە-ۭۺ-ۿݐ-ݿ'
                  'ﭐ-﷿ﹰ-﻿‌‍]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = nfc(s)
    s = MARKS.sub('', s).translate(SWAP)
    return re.sub(r'\s+', ' ', s).strip()


def plain(s):
    """The spelling a card prints: Wiktionary's, without its short-vowel marks."""
    return re.sub(r'\s+', ' ', SHORT.sub('', nfc(s))).strip()


def is_urdu(s):
    """Every letter Arabic-script (spaces and hyphens allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(ARAB.match(ch) or ch in ' -‌‍' for ch in s) and bool(WORD.search(s))


def tokens(text):
    """The Urdu words of a sentence, in order (punctuation and digits are not words)."""
    return WORD.findall(nfc(text))


# ---- the romanisation: ONE scheme, and letters the spelling shows -----------------------
# (the beginner pass, 2026-11-19).  A card's romanisation is English Wiktionary's, and
# Wiktionary's Urdu entries are not all written in one system: of 3,799 headwords 87 carried
# a letter of ANOTHER scheme (š for ś, č for c, ž for ź, ḥ ṣ ẓ ẕ for the h, s and z Urdu
# says, ḵ for x, ğ ḡ for ġ, a curled ’ ʿ ʻ for the ' of ain, ē ō for e o, w for v, ṇ for n,
# ṉ or ṃ for a nasal vowel), so one sound was written two ways and the alphabet deck's key did not cover
# the second.  `roman_norm` rewrites those letters, and only those, into the system the
# other 97% use; it changes no vowel length, no consonant and no word's reading.
_NORM = [('š', 'ś'), ('č', 'c'), ('ž', 'ź'), ('ḥ', 'h'), ('ṣ', 's'), ('ẓ', 'z'), ('ẕ', 'z'),
         ('ḵ', 'x'), ('ğ', 'ġ'), ('ḡ', 'ġ'), ('’', "'"), ('ʿ', "'"), ('ʻ', "'"), ('‘', "'"),
         ('ē', 'e'), ('ō', 'o'), ('w', 'v'), ('t̤', 't'), ('ṇ', 'n'),
         ('aiṃ', 'a͠i'), ('auṃ', 'a͠u'),
         ('Š', 'Ś'), ('Č', 'C')]
_NASAL = re.compile('([aāiīuūeo])[ṉṃ]')


def roman_norm(r):
    r = nfc(r or '')
    if not r:
        return r
    for a, b in _NORM:
        r = r.replace(nfc(a), b)
    r = _NASAL.sub(lambda m: nfc(m.group(1) + '̃'), r)
    # the tie of a nasal diphthong sits between its two vowels (ma͠i): Wiktionary's verb tables
    # write ہیں as "h͠ai", and once as "h ͠ai"
    r = re.sub(' ?͠a([iu])', 'a͠\\1', r)
    return nfc(r)


# What each consonant LETTER is in the romanisation.  The vowel letters, ain, hamza and
# nun ghunna are left out: they are read several ways, and the rule below needs only the
# consonants a romanisation cannot do without.
_CONS = {'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 'ṭ', 'ث': 's', 'ج': 'j', 'چ': 'c', 'ح': 'h',
         'خ': 'x', 'د': 'd', 'ڈ': 'ḍ', 'ذ': 'z', 'ر': 'r', 'ڑ': 'ṛ', 'ز': 'z', 'ژ': 'ź',
         'س': 's', 'ش': 'ś', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'غ': 'ġ', 'ف': 'f',
         'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ہ': 'h', 'ھ': 'H'}
_PLAIN = {'ṛ': 'r', 'ṭ': 't', 'ḍ': 'd'}
_RCONS = set('bptṭsjchxdḍzrṛźśġfqkglmn')


def roman_fit(word, roman):
    """RESTORE A RETROFLEX OR A BREATH THE SPELLING SHOWS.  Three of Wiktionary's Urdu
    headword lines romanise a ڑ as a plain r or drop the h of ھ (`توڑنا` tornā, `بڑھنا`
    baṛnā, `دراڑ` darār, where its Hindi entries have toṛnā, baṛhnā, darāṛ).  When the
    consonants of the spelling and of the romanisation agree one for one EXCEPT for that,
    the letter is restored at its place; if they do not line up, nothing is touched."""
    S = []
    for part in fold(word).split(' '):
        for i, ch in enumerate(part):
            c = _CONS.get(ch)
            if c:
                S.append('?' if (ch == 'ہ' and i == len(part) - 1) else c)
    R = [(i, ch) for i, ch in enumerate(roman) if ch in _RCONS]
    edits, i, j = [], 0, 0
    while i < len(S):
        s = S[i]
        cur = R[j][1] if j < len(R) else ''
        if s == 'H':
            if cur == 'h':
                j += 1
            elif j > 0:
                edits.append(('ins', R[j - 1][0]))
            else:
                return roman
            i += 1
        elif s == '?':
            if cur == 'h':
                j += 1
            i += 1
        elif cur == s:
            i += 1
            j += 1
            if j < len(R) and R[j][1] == s and (i >= len(S) or (S[i] != s and _PLAIN.get(S[i]) != s)):
                j += 1                          # a doubled consonant the spelling writes once
        elif s in _PLAIN and cur == _PLAIN[s]:
            edits.append(('sub', R[j][0], s))
            i += 1
            j += 1
        else:
            return roman
    if j != len(R) or not edits:
        return roman
    out = list(roman)
    for e in sorted(edits, key=lambda e: -e[1]):
        if e[0] == 'sub':
            out[e[1]] = e[2]
        else:
            out.insert(e[1] + 1, 'h')
    return ''.join(out)


def roman(word, r):
    """What a card prints for a romanisation: one scheme, and the spelling's own letters."""
    r = roman_norm(r)
    return roman_fit(word, r) if r else r
