"""The Bulgarian text helpers every stage of `.claude/bulgarian/` shares.

THE STRESS MARK IS PRINTED AND NEVER COMPARED -- the Russian and Ukrainian
pipelines' rule.  Wiktionary writes every Bulgarian form with its stress as a
COMBINING acute, U+0301 (`кни́га`, `чета́`); a card prints it, because Bulgarian
stress is free and moves through a paradigm (`град`, `градове́`), and nothing
MATCHES on it, because no corpus carries it.  `bare()` removes it by name and
never by Unicode category: `й` decomposes to и plus a combining breve, and a
pass that strips every mark would turn `мой` into `мои`.

Ѝ IS A WORD, NOT A STRESSED И.  Bulgarian orthography writes the short
pronoun "her" (dative clitic) as ѝ, with a grave, to keep it apart from the
conjunction и "and".  The card keeps it; the comparison key folds it to и,
since corpora type it ѝ, и, й or ì.

Letters Bulgarian does not have (ы э ё є і ї ґ ў, and the Serbian and
Macedonian ђ ј љ њ ћ џ ѓ ќ ѕ) mark a form as another language; the pre-1945
letters ѣ ѫ ѭ mark the old spelling Wiktionary gives as a second table.
Ъ IS A VOWEL here (the "ă" of `ъгъл`), not Russian's hard sign, and is kept.
"""
import re, unicodedata

ACUTE, GRAVE = '́', '̀'
_MARKS = re.compile('[́̀]')

LETTERS = 'А-ЩЪЬЮЯа-щъьюяѝЍ'
# A Bulgarian word in running text: letters, the stress marks and an inner hyphen
# (`по-добре`, `най-много`).
WORD_RX = re.compile('[' + LETTERS + '́̀]+(?:-[' + LETTERS + '́̀]+)*')
BG_RX = re.compile('^[' + LETTERS + '́̀ \\-]+$')
NOT_BG = re.compile('[ыэёєіїґўЫЭЁЄІЇҐЎђјљњћџѓќѕЂЈЉЊЋЏЃЌЅѣѫѭѢѪѬ]')
VOWELS = 'аеиоуъюяѝ'


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


_KEEP_I = re.compile('(?<![' + LETTERS + '])ѝ(?![' + LETTERS + '])')


def bare(s):
    """`кни́га` -> `книга`: the stress marks gone, й and the word ѝ untouched."""
    s = nfc(s).replace('ѝ', '\x00')
    s = unicodedata.normalize('NFD', s)
    s = _MARKS.sub('', s)
    s = unicodedata.normalize('NFC', s)
    # ѝ survives only as a word of its own; inside a word it was a stress mark
    s = re.sub('(?<=[' + LETTERS + '])\x00|\x00(?=[' + LETTERS + '])', 'и', s)
    return s.replace('\x00', 'ѝ')


def fold(s):
    """The comparison key: stress gone, ѝ as и, lower case."""
    return bare(s).replace('ѝ', 'и').replace('Ѝ', 'и').lower().strip()


def tokens(sentence):
    return WORD_RX.findall(nfc(sentence))


def is_bulgarian(s):
    s = nfc(s)
    return bool(s) and bool(BG_RX.match(s)) and not NOT_BG.search(s) \
        and bool(re.search('[' + LETTERS + ']', s))


def syllables(s):
    return sum(1 for ch in fold(s) if ch in VOWELS)


def show(s):
    """A form as a card prints it: Wiktionary's stress, and no mark on a word of one
    syllable (learner dictionaries never mark one); ѝ kept."""
    s = nfc(s)
    s = re.sub(r'(?<![' + LETTERS + r'])[́̀]', '', s)
    out = []
    for w in re.split(r'(\s+|-)', s):
        if w == 'ѝ':
            pass
        elif syllables(w) <= 1:
            w = bare(w)
        elif w.count(ACUTE) > 1:          # a slip marking two syllables keeps the last
            k = w.rfind(ACUTE)
            w = w[:k].replace(ACUTE, '') + w[k:]
        out.append(w)
    return ''.join(out)


def speak(s):
    """What the speaker reads: no stress mark (synthesisers read it as a letter)."""
    return bare(nfc(s))


# THE PERSONAL PRONOUNS' FORMS, WRITTEN OUT.  Bulgarian has lost the noun cases
# but its personal pronouns keep three: the nominative, the accusative and the
# dative, each but the nominative with a FULL form (stressed, used after a
# preposition or for emphasis) and a SHORT clitic form (the everyday one:
# `виждам го`, `дай ми`).  Wiktionary gives these pronouns no table, so a
# sentence with `го` would reach no lemma; these are the standard paradigms.
# The full dative is на + the accusative's full form (`на него`).
PRONOUN_CASES = {
    'аз':   ['аз', 'ме́не, мен', 'ме', 'на ме́не, на мен', 'ми'],
    'ти':   ['ти', 'те́бе, теб', 'те', 'на те́бе, на теб', 'ти'],
    'той':  ['той', 'не́го', 'го', 'на не́го', 'му'],
    'тя':   ['тя', 'не́я', 'я', 'на не́я', 'ѝ'],
    'то':   ['то', 'не́го', 'го', 'на не́го', 'му'],
    'ние':  ['ни́е', 'нас', 'ни', 'на нас', 'ни'],
    'вие':  ['ви́е', 'вас', 'ви', 'на вас', 'ви'],
    'те':   ['те', 'тях', 'ги', 'на тях', 'им'],
}
CASE_NAMES = ('nominative', 'accusative', 'accusative, short', 'dative', 'dative, short')


def pronoun_forms(word):
    row = PRONOUN_CASES.get(fold(word))
    if row is None:
        return None
    out = []
    for cell in row:
        for w in re.split(r'[\s,]+', cell):
            if w and w != 'на' and w not in out:
                out.append(w)
    return out
