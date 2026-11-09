"""Small Vietnamese helpers shared by every stage of `.claude/vietnamese/`.

THE FOLD.  Vietnamese is written in the Latin alphabet, one SYLLABLE per
space-separated token, with a tone mark on one vowel.  Two spellings of the
same syllable are both in use and a dictionary and a corpus do not agree on
them: where the tone mark sits in `oa`, `oe`, `uy` -- the older `hoà`, `khoẻ`,
`thuỷ` (Wiktionary's headwords, mostly) against the newer `hòa`, `khỏe`, `thủy`
(much running text).  So `fold()` lowercases, decomposes, takes the TONE mark
off the syllable (the vowel-quality marks ă â ê ô ơ ư đ stay, being letters)
and writes it after the syllable as a digit.  The fold is for MATCHING only:
what a card prints is the dictionary's own spelling.

THE TONE of a syllable is read off its mark, and only off its mark -- six
tones, the names Vietnamese grammar gives them.  It is spelling, not a claim
about any speaker's pitch.
"""
import re, unicodedata

# combining mark -> (tone digit, Vietnamese name, English description)
TONE_MARKS = {
    '̀': '2',   # grave        huyền
    '́': '3',   # acute        sắc
    '̉': '4',   # hook above   hỏi
    '̃': '5',   # tilde        ngã
    '̣': '6',   # dot below    nặng
}
TONE_NAMES = {'1': 'ngang', '2': 'huyền', '3': 'sắc', '4': 'hỏi', '5': 'ngã', '6': 'nặng'}

LETTER = 'a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ' \
         'ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ'
WORD = re.compile('[' + LETTER + ']+')
VIET = re.compile('^[' + LETTER + r' \-]+$')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def tone(syl):
    """The tone digit of one syllable ('1' when it carries no mark)."""
    for ch in unicodedata.normalize('NFD', syl):
        if ch in TONE_MARKS:
            return TONE_MARKS[ch]
    return '1'


def fold_syl(syl):
    d = unicodedata.normalize('NFD', syl.lower())
    t = '1'
    out = []
    for ch in d:
        if ch in TONE_MARKS:
            t = TONE_MARKS[ch]
        else:
            out.append(ch)
    return unicodedata.normalize('NFC', ''.join(out)) + t


def fold(s):
    """A word's matching key: each syllable folded, joined by single spaces."""
    return ' '.join(fold_syl(x) for x in tokens(s))


def is_viet(s):
    s = nfc(s).strip()
    return bool(s) and bool(VIET.match(s)) and bool(WORD.search(s))


def tokens(text):
    """The syllables of a text, in order (punctuation and digits are not syllables)."""
    return WORD.findall(nfc(text))
