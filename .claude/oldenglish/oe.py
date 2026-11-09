"""Old English text helpers shared by every stage: the FOLD and the tokeniser.

THE FOLD.  Old English has no standard spelling.  Wiktionary prints a normalised
early West Saxon headword with macrons and dotted letters (iċ, ġelufod, þǣre),
while the corpus this pipeline counts -- Thorpe's 1844 Ælfric, Sweet's Primer,
Tatoeba -- writes late West Saxon with no macrons, manuscript accents (hí, hé),
ð and þ used interchangeably, and y where early West Saxon has ie or i
(hyran / hieran, gehyrsumnys / gehiersumnes).  Every comparison goes through
`fold`, so those differences are not differences; the cards print Wiktionary's
spelling.

What it folds, each one a variation the corpus actually shows:
  · case, and every accent and macron (ā á â → a; ǣ ǽ → æ);
  · ċ ġ → c g (the dots are an editor's, not a scribe's);
  · ð → þ; ƿ → w; ȝ and the insular ᵹ → g (Tatoeba prints some sentences in the
    manuscript letters: cƿeðe, ᵹelufod);
  · y → i and ie → i (late West Saxon smoothing: hyran, hieran, hiran);
  · -nys / -nyss- → -nes / -ness- at the end of a long word (Ælfric's spelling of
    the abstract suffix: gehyrsumnys);
  · hyphens are dropped (Thorpe hyphenates compounds: leorning-cnihtum).
"""
import re
import unicodedata

_MAP = str.maketrans({'ð': 'þ', 'ƿ': 'w', 'ȝ': 'g', 'ᵹ': 'g', 'y': 'i', 'ꝥ': 'þæt'})


def nfc(s):
    return unicodedata.normalize('NFC', s)


def fold(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')   # accents, macrons, dots
    s = unicodedata.normalize('NFC', s).translate(_MAP).replace('-', '')
    s = s.replace('ie', 'i')
    if len(s) > 6:
        s = re.sub(r'nis(s?)(e|a|um|es)?$', lambda m: 'nes' + m.group(1) + (m.group(2) or ''), s)
    return s


# A token is a run of letters (Old English letters included); digits and punctuation split.
_TOK = re.compile(r"[^\W\d_]+(?:-[^\W\d_]+)*")


def tokens(s):
    return _TOK.findall(s)
