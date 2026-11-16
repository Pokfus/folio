"""The Serbian text helpers every stage of `.claude/serbian/` shares.

SERBIAN IS WRITTEN IN TWO ALPHABETS, Cyrillic (the official one) and Gaj's
Latin, and the two map letter for letter: 30 letters each, љ њ џ being the
digraphs lj nj dž.  The sources split on it -- English Wiktionary files a full
entry under each spelling, the subtitle list is mostly Latin, Tatoeba's
Serbian is mostly Cyrillic -- so EVERYTHING IS COMPARED IN LATIN (`fold`):
Cyrillic to Latin is exact, letter for letter.  Latin to Cyrillic is not,
quite: a few words join a prefix to a ž or a j (`nadživeti`, `injekcija`),
where the pair is two letters and not the digraph.  `cyr()` knows those, and
`build_deck.py` prints the headword's Cyrillic from Wiktionary's own Cyrillic
spelling, never from the converter, and reports any word where the two differ.

THE ACCENT MARKS ARE PRINTED ON THE HEADWORD AND NEVER COMPARED.  Wiktionary
writes Serbo-Croatian headwords with the four tonal accents and the length
mark of the standard (`ку̏ћа`, `вре́ме`, `ле̑п`, `го̄ст`): the double grave,
the acute, the grave and the inverted breve, and the macron.  No corpus
carries them.  `bare()` removes them BY NAME, never by Unicode category: the
acute of ć (c + U+0301 decomposed) and the caron of č š ž are letters, and a
pass that strips every mark would turn `ćao` into `cao` and `šta` into `sta`.

EKAVIAN.  Serbian in Serbia is Ekavian (`mleko`, `vreme`, `lep`); Bosnia,
Montenegro and Croatia's Serbs say ije (`mlijeko`).  The decks teach the
Ekavian standard, and `extract.py` folds an Ijekavian lemma's count into its
Ekavian partner.
"""
import re, unicodedata

CYR = 'абвгдђежзијклљмнњопрстћуфхцчџш'
LAT = ['a', 'b', 'v', 'g', 'd', 'đ', 'e', 'ž', 'z', 'i', 'j', 'k', 'l', 'lj', 'm', 'n', 'nj',
       'o', 'p', 'r', 's', 't', 'ć', 'u', 'f', 'h', 'c', 'č', 'dž', 'š']
C2L = dict(zip(CYR, LAT))
L2C = {v: k for k, v in C2L.items()}

# The tonal accents and the length mark: double grave, acute, grave, inverted breve,
# macron, and the circumflex some sources use for the long falling accent.
_ACC = '̏́̀̑̄̂'
_ACC_RX = re.compile('[' + _ACC + ']')

LETTERS_LAT = 'a-zčćđšžA-ZČĆĐŠŽ'
LETTERS_CYR = 'а-шђјљњћџА-ШЂЈЉЊЋЏ'
WORD_RX = re.compile('[' + LETTERS_LAT + LETTERS_CYR + _ACC + ']+(?:-[' + LETTERS_LAT +
                     LETTERS_CYR + _ACC + ']+)*')
# Letters a Serbian word never has: q w x y (foreign names aside) and the Cyrillic of other languages.
NOT_SR_LAT = re.compile('[qwxyäöüßàèìòùâêîôûéáíóú]', re.I)
NOT_SR_CYR = re.compile('[ыэъёйщьюяєіїґѓќѕЫЭЪЁЙЩЬЮЯЄІЇҐЃЌЅ]')
VOWELS = 'aeiou'


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def bare(s):
    """`ку̏ћа` -> `кућа`, `kȕća` -> `kuća`: the accent marks gone, ć č š ž untouched."""
    s = unicodedata.normalize('NFD', s or '')
    # the acute is a letter's on c (ć) -- keep it there and nowhere else
    s = re.sub('(?<![cC])́', '', s)
    s = re.sub('[̏̀̑̄̂]', '', s)
    return unicodedata.normalize('NFC', s)


def is_cyr(s):
    return bool(re.search('[' + LETTERS_CYR + ']', s or ''))


def lat(s):
    """Cyrillic -> Latin, exact; Latin passes through."""
    out = []
    for ch in nfc(s):
        lo = ch.lower()
        if lo in C2L:
            t = C2L[lo]
            out.append(t if ch == lo else (t[0].upper() + t[1:]))
        else:
            out.append(ch)
    return ''.join(out)


# Where a Latin pair is two letters and not a digraph: a prefix ending in d or n before ž or
# j, and the loanwords Serbian orthography lists (Pravopis, §on transliteration).  Written as
# the word's start (or a stem inside it) with the split marked by '|'.
SPLIT = ['nad|ž', 'od|ž', 'pod|ž', 'pred|ž', 'in|jek', 'kon|jug', 'kon|junk', 'tan|jug',
         'van|jsk', 'van|jezik', 'in|jekt']


def cyr(s):
    """Latin -> Cyrillic: the digraphs dž lj nj greedily, except across a SPLIT."""
    s = nfc(s)
    low = s.lower()
    cuts = set()
    for sp in SPLIT:
        a, b = sp.split('|')
        for m in re.finditer(re.escape(a + b), low):
            if m.start() == 0 or not low[m.start() - 1].isalpha():
                cuts.add(m.start() + len(a))
    out, i = [], 0
    while i < len(s):
        two = low[i:i + 2]
        if two in ('dž', 'lj', 'nj') and (i + 1) not in cuts:
            c = L2C[two]
            out.append(c.upper() if s[i].isupper() else c)
            i += 2
            continue
        ch = s[i]
        c = L2C.get(ch.lower())
        out.append((c.upper() if ch.isupper() else c) if c else ch)
        i += 1
    return ''.join(out)


def fold(s):
    """The comparison key: Latin, accent marks gone, lower case."""
    return lat(bare(s)).lower().strip()


def tokens(sentence):
    return WORD_RX.findall(nfc(sentence))


def is_serbian(s):
    """A Serbian word in either alphabet (spaces and hyphens allowed), no foreign letters."""
    s = bare(nfc(s))
    if not s or not re.search('[' + LETTERS_LAT + LETTERS_CYR + ']', s):
        return False
    if is_cyr(s):
        return not NOT_SR_CYR.search(s) and bool(re.match('^[' + LETTERS_CYR + ' \\-]+$', s))
    return not NOT_SR_LAT.search(s) and bool(re.match('^[' + LETTERS_LAT + ' \\-]+$', s))


def syllables(s):
    w = fold(s)
    n = sum(1 for ch in w if ch in VOWELS)
    # a syllabic r between consonants (`prst`, `crven`, `vrt`) is a syllable of its own
    n += len(re.findall('(?:^|[^aeiou])r(?=[^aeiour]|$)', w)) if 'r' in w else 0
    return n


def speak(s):
    """What the speaker reads: Cyrillic, no accent marks."""
    return bare(nfc(s))


# THE PERSONAL PRONOUNS' CASES, WRITTEN OUT, full forms first and the clitics after.
# Wiktionary's tables hold them, but `ja`'s also lists `mi` and `nas` (the plural), so read
# off the dump each pronoun would claim another's forms.  Nominative, genitive, dative,
# accusative, instrumental, locative; the standard paradigms of every grammar.
PRONOUN_CASES = {
    'ja':   ['ја', 'мене, ме', 'мени, ми', 'мене, ме', 'мном, мноме', 'мени'],
    'ti':   ['ти', 'тебе, те', 'теби, ти', 'тебе, те', 'тобом', 'теби'],
    'on':   ['он', 'њега, га', 'њему, му', 'њега, га', 'њим, њиме', 'њему'],
    'ona':  ['она', 'ње, је', 'њој, јој', 'њу, ју, је', 'њом, њоме', 'њој'],
    'ono':  ['оно', 'њега, га', 'њему, му', 'њега, га', 'њим, њиме', 'њему'],
    'mi':   ['ми', 'нас', 'нама, нам', 'нас', 'нама', 'нама'],
    'vi':   ['ви', 'вас', 'вама, вам', 'вас', 'вама', 'вама'],
    'oni':  ['они', 'њих, их', 'њима, им', 'њих, их', 'њима', 'њима'],
    'sebe': ['—', 'себе, се', 'себи, си', 'себе, се', 'собом', 'себи'],
}
CASE_NAMES = ('nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'locative')


def pronoun_forms(word):
    row = PRONOUN_CASES.get(fold(word))
    if row is None:
        return None
    out = []
    for cell in row:
        out += [lat(w) for w in re.split(r'[\s,()]+', cell) if w and w != '—']
    return out
