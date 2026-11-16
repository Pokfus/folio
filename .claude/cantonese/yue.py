"""Small helpers shared by the Cantonese stages: Jyutping, CJK letters, the variant fold.

JYUTPING (the Linguistic Society of Hong Kong's romanisation, 1993) writes every syllable as letters
followed by ONE tone digit, 1 to 6: nei5 hou2 "hello".  The sources write it three ways -- spaced and
digit-final (CC-Canto, CC-CEDICT's readings), run together per word (HKCanCor: lou5gung1) and with
superscript digits (Tatoeba's transcriptions: heoi⁵) -- and `syllables` reads all three into one list.

THE VARIANT FOLD (`fold`).  Written Cantonese has no single orthography for its particles, and the
sources disagree: HKCanCor writes 𡃉 where CC-Canto and every Hong Kong primer write 㗎 (gaa3), 囖 for
囉 (lo1), 嚹 for 喇 (laa3) -- each a character a learner will never meet in print.
The fold is used ONLY to count (a corpus token is filed under the spelling the dictionary uses); a card
always prints the dictionary's own headword.  Every row carries the evidence that the two spell one
word: the same syllable in both sources.
"""
import re
import unicodedata

FOLD = {
    # each row: HKCanCor's character -> the dictionary's, and the one syllable both give it
    '𡃉': '㗎',   # gaa3, the assertive particle (1,810 tokens; CC-Canto 㗎 gaa3)
    '囖': '囉',   # lo1, sentence particle (CC-Canto 囉 lo1)
    '嚹': '喇',   # laa3, sentence particle (CC-Canto 喇 laa3)
    '𠻹': '添',   # tim1, "as well" (CC-Canto 添 tim1, final particle)
    '𡁵': '緊',   # gan2, the progressive marker (CC-Canto 緊 gan2)
    '𠸏': '嘅',   # ge2, the assertive particle (CC-Canto 嘅 ge2)
}

SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')
SYL = re.compile(r'[a-z]+[1-6]')
CJK = re.compile(r'[㐀-䶿一-鿿\U00020000-\U0003134f豈-﫿]')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    return ''.join(FOLD.get(ch, ch) for ch in nfc(s))


def syllables(jp):
    """'nei5hou2', 'nei5 hou2', 'nei⁵ hou²' -> ['nei5', 'hou2']; [] if any letter is left over."""
    t = nfc(jp).translate(SUP).lower().replace(' ', '')
    out = SYL.findall(t)
    return out if ''.join(out) == t and all(valid(x) for x in out) else []


# A Jyutping syllable: an optional initial, a final, a tone.  CC-Canto has the odd typo (成日 "seng4
# yat6": y is Yale's initial, not Jyutping's), and a reading that is not Jyutping is not a reading.
VALID = re.compile(r'(?:(?:b|p|m|f|d|t|n|l|gw|kw|g|k|ng|h|w|z|c|s|j)?'
                   r'(?:aa(?:i|u|m|n|ng|p|t|k)?|a(?:i|u|m|n|ng|p|t|k)|e(?:i|u|m|n|ng|p|t|k)?|'
                   r'i(?:u|m|n|ng|p|t|k)?|o(?:i|u|n|ng|t|k)?|oe(?:ng|k)?|eo(?:i|n|t)|'
                   r'u(?:i|n|ng|t|k)?|yu(?:n|t)?)|m|ng)[1-6]')


def valid(syl):
    return bool(VALID.fullmatch(syl))


def spaced(jp):
    s = syllables(jp)
    return ' '.join(s) if s else ''


def is_cjk(ch):
    return bool(CJK.fullmatch(ch))


def all_cjk(s):
    return bool(s) and all(is_cjk(ch) for ch in s)
