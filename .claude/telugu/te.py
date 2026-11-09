"""Small Telugu helpers shared by every stage of `.claude/telugu/`.

THE FOLD.  Telugu spelling varies in ways a dictionary and a corpus do not
agree on, and a match that ignores them loses words:
  · a noun's final -ము (-mu) is the classical, dictionary spelling and the
    anusvara -ం (-ṃ) the modern one -- Wiktionary has `పుస్తకము` and
    `పుస్తకం` as two entries, running text writes `పుస్తకం`;
  · the doubled ḷ is written `ళ్ళ` and `ళ్ల` (`నీళ్ళు` / `నీళ్లు`, Wiktionary
    files one as an alternative form of the other);
  · the zero-width joiner and non-joiner change a conjunct's SHAPE, not the word.
So `fold()` normalises, drops the joiners, writes `్ళ` as `్ల` and a final
`ము` as `ం`.  The fold is for MATCHING only: what a card prints is the
dictionary's own spelling.
"""
import re, unicodedata

TELU = re.compile(r'[ఀ-౿]')
WORD = re.compile(r'[ఀ-ౣ౦-౿‌‍]+')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def fold(s):
    s = nfc(s).replace('‌', '').replace('‍', '').replace('్ళ', '్ల')
    s = re.sub(r'ము(?=\s|$)', 'ం', s)
    return s.strip()


def is_telugu(s):
    """Every letter Telugu (spaces and hyphens allowed)."""
    s = (s or '').strip()
    if not s:
        return False
    return all(TELU.match(ch) or ch in ' -‌‍' for ch in s)


def tokens(text):
    """The Telugu words of a sentence, in order (digits and punctuation are not words)."""
    return WORD.findall(nfc(text))
