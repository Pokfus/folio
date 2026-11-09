"""Small Tamil helpers shared by every stage of `.claude/tamil/`.

THE FOLD.  Tamil spelling varies less than Hindi's, but a dictionary and a corpus
still disagree in two invisible ways a match must ignore:
  · the two-part vowel signs (ொ ோ ௌ) can be stored precomposed or as their two
    halves (ெ + ா); NFC puts both in one form;
  · a zero-width joiner or non-joiner sometimes sits inside a word (கஷ்டம் typed
    with a ZWNJ to stop a conjunct); it is dropped.
The fold is for MATCHING only: what a card prints is the dictionary's own spelling.
"""
import re, unicodedata

TAMIL = re.compile(r'[஀-௿]')
WORD = re.compile(r'[஀-௥௰-௿‌‍]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = unicodedata.normalize('NFC', s or '')
    return s.replace('‌', '').replace('‍', '').strip()


def is_tamil(s):
    """Every letter Tamil (spaces and hyphens allowed), and at least one letter."""
    s = (s or '').strip()
    if not s or not TAMIL.search(s):
        return False
    return all(TAMIL.match(ch) or ch in ' -‌‍' for ch in s)


def tokens(text):
    """The Tamil words of a sentence, in order (Tamil digits are not words)."""
    return WORD.findall(nfc(text))


# THE SANDHI CONSONANT.  Before a word that begins with a hard consonant, Tamil
# writing doubles it onto the end of the word before: வீட்டுக்கு + போ is written
# வீட்டுக்குப் போ.  The subtitles and Tatoeba are full of such tokens, which no
# table lists.  `bare()` takes the doubled consonant off -- the caller uses it
# only when the token itself is not a known form and the bare one is, so a word
# that really ends in one (டிக்கெட் "ticket") is never cut.
HARD = 'கசடதபற'
VIRAMA = '்'


def bare(s):
    if len(s) > 3 and s[-1] == VIRAMA and s[-2] in HARD and s[-3] != VIRAMA:
        return s[:-2]
    return s
