"""The Ukrainian text helpers every stage of `.claude/ukrainian/` shares.

THE STRESS MARK IS PRINTED AND NEVER COMPARED -- the Russian pipeline's rule
(`.claude/torfl/russian.py`).  Wiktionary writes every Ukrainian form with its
stress as a COMBINING acute, U+0301 (`кни́га`, `роблю́`); a card prints it,
because Ukrainian stress is free and moves through a paradigm, and nothing
MATCHES on it, because no corpus carries it.  `bare()` removes it, by name and
never by Unicode category: `й` and `ї` decompose to и / і plus a combining
mark, and a pass that strips every mark would turn `мій` into `мии`.

THE APOSTROPHE IS DROPPED FOR COMPARISON.  Ukrainian writes an apostrophe
before я, ю, є, ї after a labial or р (`п'ять`, `м'ясо`, `сім'я`), and the
sources disagree on it: Wiktionary types an ASCII ', Tatoeba mostly ' and
sometimes ’ or ʼ, and the subtitle list leaves it out altogether (`пять`) or
writes a backtick (`п`ять`).  `fold()` removes all five; the card prints
Wiktionary's spelling with the typographic apostrophe ʼ (U+02BC), the one the
Ukrainian orthography's own Unicode guidance names, so a learner sees one form.

Г AND Ґ ARE NEVER FOLDED: they are two letters (h and g) and two words can
differ by them alone.
"""
import re, unicodedata

ACUTE, GRAVE = '́', '̀'
_MARKS = re.compile('[́̀]')
APOS = "'’ʼ`ʹ"
_APOS = re.compile("[" + APOS + "]")
PRINT_APOS = 'ʼ'

LETTERS = 'А-ЩЬЮЯЄІЇҐа-щьюяєіїґ'
# A Ukrainian word in running text: letters, the stress marks, an inner apostrophe
# and an inner hyphen (`будь-ласка`, `де-не-де`).
WORD_RX = re.compile('[' + LETTERS + '́̀]+(?:[' + APOS + '\\-][' + LETTERS +
                     '́̀]+)*')
UK_RX = re.compile('^[' + LETTERS + '́̀' + APOS + ' \\-]+$')
# Letters Ukrainian does not have.  A form carrying one is Russian (or pre-1933
# spelling), and the subtitle list holds a great deal of Russian.
NOT_UK = re.compile('[ыэъёЫЭЪЁ]')
VOWELS = 'аеєиіїоуюя'


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def bare(s):
    """`кни́га` -> `книга`: the stress marks gone, й ї untouched."""
    s = unicodedata.normalize('NFD', s or '')
    s = _MARKS.sub('', s)
    return unicodedata.normalize('NFC', s)


def fold(s):
    """The comparison key: stress and apostrophe gone, lower case."""
    return _APOS.sub('', bare(s)).lower().strip()


def tokens(sentence):
    return WORD_RX.findall(nfc(sentence))


def is_ukrainian(s):
    s = nfc(s)
    return bool(s) and bool(UK_RX.match(s)) and not NOT_UK.search(s) \
        and bool(re.search('[' + LETTERS + ']', s))


def syllables(s):
    return sum(1 for ch in fold(s) if ch in VOWELS)


def show(s):
    """A form as a card prints it: Wiktionary's stress, the typographic apostrophe,
    and no mark on a word of one syllable (learner dictionaries never mark one)."""
    s = nfc(s)
    s = re.sub(r'(?<![' + LETTERS + r'])[́̀]', '', s)
    s = _APOS.sub(PRINT_APOS, s)
    out = []
    for w in re.split(r'(\s+|-)', s):
        if syllables(w) <= 1:
            w = bare(w)
        elif w.count(ACUTE) > 1:          # a slip marking two syllables keeps the last
            k = w.rfind(ACUTE)
            w = w[:k].replace(ACUTE, '') + w[k:]
        out.append(w)
    return ''.join(out)


def speak(s):
    """What the speaker reads: no stress mark (synthesisers read it as a letter)."""
    return _APOS.sub(PRINT_APOS, bare(nfc(s)))


# THE PERSONAL PRONOUNS' CASES, WRITTEN OUT.  Wiktionary gives every Ukrainian
# personal pronoun ONE shared table -- `він`'s entry lists `я`, `мене́` and `ти`
# among its forms -- so read off the dump each pronoun would claim the others'
# forms (and their counts), and a sentence with `тебе` would be an example of
# `я`.  These are the standard paradigms, in the order nominative, genitive,
# dative, accusative, instrumental, locative; the н- forms in brackets are the
# ones used after a preposition (`у нього`, `з нею`).
PRONOUN_CASES = {
    'я':    ['я', 'мене́', 'мені́', 'мене́', 'мно́ю', 'мені́'],
    'ти':   ['ти', 'тебе́', 'тобі́', 'тебе́', 'тобо́ю', 'тобі́'],
    'він':  ['він', 'його́ (ньо́го)', 'йому́', 'його́ (ньо́го)', 'ним', 'ньо́му'],
    'вона': ['вона́', 'її́ (не́ї)', 'їй', 'її́ (не́ї)', 'не́ю', 'ній'],
    'воно': ['воно́', 'його́ (ньо́го)', 'йому́', 'його́ (ньо́го)', 'ним', 'ньо́му'],
    'ми':   ['ми', 'нас', 'нам', 'нас', 'на́ми', 'нас'],
    'ви':   ['ви', 'вас', 'вам', 'вас', 'ва́ми', 'вас'],
    'вони': ['вони́', 'їх (них)', 'їм', 'їх (них)', 'ни́ми', 'них'],
    'себе': ['—', 'себе́', 'собі́', 'себе́', 'собо́ю', 'собі́'],
}
CASE_NAMES = ('nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'locative')


def pronoun_forms(word):
    row = PRONOUN_CASES.get(fold(word))
    if row is None:
        return None
    out = []
    for cell in row:
        out += [w for w in re.split(r'[\s,()]+', cell) if w and w != '—']
    return out
