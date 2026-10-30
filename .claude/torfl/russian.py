#!/usr/bin/env python3
"""The Russian text helpers every stage shares: stress, ё, and what a word is.

THE STRESS MARK IS PRINTED AND NEVER COMPARED.  Wiktionary writes every form
with its stress (`кни́га`, `руки́`) as a COMBINING acute, U+0301, after the vowel
it marks -- occasionally a grave, U+0300, for a secondary stress.  A card
prints it, because Russian stress is free and moves through a paradigm and a
learner has no other way to know it; nothing ever MATCHES on it, because no
corpus carries it.  Tatoeba's sentences, the subtitle frequency list and
anything a reader types are all unstressed.  So `bare()` is applied to both
sides of every comparison and to everything sent to speech synthesis.

Ё IS FOLDED FOR COMPARISON AND KEPT FOR PRINTING.  Russian writing may spell ё
as е, and every corpus does so inconsistently: in the same subtitle list `еще`
(rank 67) and `ещё` (rank 96) are separate rows.  `fold()` maps ё to е on top of
`bare()`.  It costs one real merger -- `все` (all, plural) and `всё` (everything)
fold together -- and that pair is the one where the corpus's own spelling cannot
be trusted to separate them anyway.

`й` IS NOT AN ACCENTED и.  An NFD decomposition splits it into и + U+0306 and a
naive "strip the combining marks" pass would turn `мой` into `мои`.  So the
marks are removed by name -- the acute and the grave only -- never by category.
"""
import re, unicodedata

ACUTE, GRAVE = '́', '̀'
_MARKS = re.compile('[́̀]')

# A Russian word for tokenising a sentence: Cyrillic letters, the two stress
# marks, and an inner hyphen (`по-русски`, `кто-то`, `из-за`).
WORD_RX = re.compile(r"[А-Яа-яЁё́̀]+(?:-[А-Яа-яЁё́̀]+)*")
CYR_RX = re.compile(r'^[А-Яа-яЁё́̀ \-]+$')

# Pre-reform spellings (`дѣ́лать`), which Wiktionary lists as `alternative`
# forms.  A learner of modern Russian never meets them.
OLD_LETTERS = re.compile('[ѣѢіІѳѲѵѴ]|ъ$')


def nfc(s):
    return unicodedata.normalize('NFC', s or '')


def bare(s):
    """`кни́га` -> `книга`: the stress marks gone, ё kept, й untouched."""
    s = unicodedata.normalize('NFD', s or '')
    s = _MARKS.sub('', s)
    return unicodedata.normalize('NFC', s)


def fold(s):
    """The comparison key: stress gone, ё -> е, lower case."""
    return bare(s).lower().replace('ё', 'е')


def tokens(sentence):
    """The words of a sentence, in order, as written."""
    return WORD_RX.findall(sentence or '')


def is_russian(s):
    return bool(s) and bool(CYR_RX.match(s)) and not OLD_LETTERS.search(s)


def syllables(s):
    return sum(1 for ch in fold(s) if ch in 'аеиоуыэюя')


def show(s):
    """A form as a card prints it.

    Wiktionary marks the stress of a one-syllable word in some templates and not
    in others; learner dictionaries never do, and a mark on `да` or `нет`
    teaches nothing.  A form with ё carries no other mark either, ё being
    always stressed.
    """
    s = nfc(s)
    # A MARK DETACHED BY A SPACE (`как дела ́` in Wiktionary's headword line) goes
    # back on the vowel before it; any other mark not after a letter is dropped.
    s = re.sub(r'([аеиоуыэюяАЕИОУЫЭЮЯ])\s+([\u0301\u0300])', r'\1\2', s)
    s = re.sub(r'(?<![А-Яа-яЁё])[\u0301\u0300]', '', s)
    # A WORD MARKED ON TWO SYLLABLES (`исклю́че́ние`, a Wiktionary slip) keeps the
    # last mark; a hyphenated compound marks each half and is left alone
    def one(m):
        w = m.group(0)
        if w.count(ACUTE) > 1:
            k = w.rfind(ACUTE)
            w = w[:k].replace(ACUTE, '') + w[k:]
        return w
    s = re.sub(r'[^\s\-/,()]+', one, s)
    if syllables(s) <= 1 or 'ё' in s.lower():
        if ' ' not in s:
            return bare(s)
    return s


# THE PERSONAL PRONOUNS' CASES, WRITTEN OUT.  Wiktionary gives every personal
# pronoun one shared table -- `я`'s entry lists `ты`, `он`, `нас` and `их` among
# its forms -- so read off the dump, each pronoun would claim the others' forms,
# and a sentence with `тебя` would count as an example of `я`.  These are the
# standard paradigms, in the order nominative, genitive, accusative, dative,
# instrumental, prepositional; the н- forms are the ones used after a
# preposition (`у него`, `с ней`).
PRONOUN_CASES = {
    'я':    ['я', 'меня́', 'меня́', 'мне', 'мной, мно́ю', 'мне'],
    'ты':   ['ты', 'тебя́', 'тебя́', 'тебе́', 'тобо́й, тобо́ю', 'тебе́'],
    'он':   ['он', 'его́ (него́)', 'его́ (него́)', 'ему́ (нему́)', 'им (ним)', 'нём'],
    'оно':  ['оно́', 'его́ (него́)', 'его́ (него́)', 'ему́ (нему́)', 'им (ним)', 'нём'],
    'она':  ['она́', 'её (неё)', 'её (неё)', 'ей (ней)', 'ей, е́ю (ней, не́ю)', 'ней'],
    'мы':   ['мы', 'нас', 'нас', 'нам', 'на́ми', 'нас'],
    'вы':   ['вы', 'вас', 'вас', 'вам', 'ва́ми', 'вас'],
    'они':  ['они́', 'их (них)', 'их (них)', 'им (ним)', 'и́ми (ни́ми)', 'них'],
    'себя': ['—', 'себя́', 'себя́', 'себе́', 'собо́й, собо́ю', 'себе́'],
}
CASE_NAMES = ('nominative', 'genitive', 'accusative', 'dative', 'instrumental',
              'prepositional')


def pronoun_forms(word):
    """The single-word forms of a personal pronoun, stressed, or None."""
    row = PRONOUN_CASES.get(fold(word))
    if row is None:
        return None
    out = []
    for cell in row:
        out += [w for w in re.split(r'[\s,()]+', cell) if w and w != '—']
    return out


def paradigm(e):
    """An entry's forms as [form, tags], with the pronouns' shared table fixed."""
    pf = pronoun_forms(e['word']) if e['pos'] == 'pron' else None
    if pf is not None:
        return [[w, []] for w in pf]
    return e['forms']
