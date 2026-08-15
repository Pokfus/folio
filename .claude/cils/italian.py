#!/usr/bin/env python3
"""The Italian a card needs: spelling, the article, and regular inflection.

Two things in here are the whole reason this module exists rather than being a
handful of lines inside the builder.

**WIKTIONARY'S ITALIAN IS NOT SPELLED THE WAY ITALIAN IS SPELLED**, and it is
the loudest silent fault this pipeline has.  Every headword and every inflected
form in the dump carries a PRONUNCIATION stress mark on its tonic vowel:
`èssere`, `sóno`, `parlàre`, `pàrlo`, `amichétto`, `chiamàrsi`.  Italian
orthography writes an accent only where the stress falls on the LAST vowel of
the word -- `città`, `perché`, `caffè`, `però`, `più`, `lunedì` -- and nowhere
else, ever.  So a deck that passes those strings straight through teaches a
spelling that does not exist, on every card, and nothing about it looks wrong:
the accent is plausible, the word is the right word, the card renders perfectly.
`destress` is the one gate, and everything taken out of a record goes through
it.

**THE ARTICLE IS DECIDED BY SPELLING, NOT ONLY BY GENDER**, which is what makes
it worth teaching at all and what makes it derivable.  German has three articles
chosen by gender alone and Spanish two; Italian has four in the singular and
three in the plural, and which one a masculine noun takes depends on the sounds
it starts with -- `il libro` but `lo studente`, `lo zio`, `lo psicologo`,
`l'amico`, and in the plural `i libri` against `gli studenti`.  A learner has to
know the rule and a card can show it, so the article is COMPUTED from the word
and its gender rather than looked up, and the plural article is shown beside the
plural for the reason below.

**AND `l'` HIDES THE GENDER, which is why the plural is on the card too.**  The
singular article elides before a vowel in BOTH genders, so `l'amico` and
`l'amica` look alike and the one thing the article is there to teach is exactly
what it stops teaching.  The plural does not elide -- `gli amici` against `le
amiche` -- so a vowel-initial noun's gender is legible in its plural even where
it is not in its singular.  The builder colours the article by gender as well,
which is the Goethe deck's rule, but the plural is what carries it in print.
"""
import re
import unicodedata

# ---------------------------------------------------------------- spelling

# The tonic-stress marks Wiktionary writes and Italian does not.  Both the
# grave and the acute occur, and the distinction is real where the vowel is
# final (`caffè` open, `perché` closed), so a final mark is kept exactly as
# written and only a non-final one is stripped.
_STRESS = str.maketrans({
    'à': 'a', 'á': 'a', 'â': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u',
    'À': 'A', 'Á': 'A', 'È': 'E', 'É': 'E', 'Ì': 'I', 'Í': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ù': 'U', 'Ú': 'U',
})

# a trailing apostrophe is part of the token but not its last LETTER, so
# `bell’` has to be measured back past it
_APOS = "'’ʼ"

# **THE MONOSYLLABLES ARE A CLOSED LIST, AND EVERYTHING OUTSIDE IT IS BARE.**
# The "an accent on the final vowel is orthographic" rule is right for a word of
# two syllables or more -- `città`, `perché`, `andrò` -- and wrong for a word of
# one, where Italian writes no accent at all unless the word is on this list.
# Wiktionary marks the stress on every monosyllable regardless, so read straight
# it hands back `và`, `fà`, `hò`, `stà`, `sò`, `dò`: nine wrong spellings among
# the commonest verbs in the language, on the present tense of `andare`, `fare`,
# `stare`, `sapere`, `dare` and `avere`.  Found by reading a card, not by any
# count -- `và` is a plausible-looking Italian word and every total was healthy.
#
# The list is the standard one: the accent is there to separate a homograph
# (`dà` the verb from `da` the preposition, `è` from `e`, `né` from `ne`, `sé`
# from `se`, `sì` from `si`, `là`/`lì` from `la`/`li`, `dì` from `di`, `tè` from
# `te`) or is simply how the word is written (`più`, `giù`, `già`, `ciò`, `può`,
# `cioè`).  A vowel cluster counts as one syllable, so `più` and `può` are
# monosyllables and are here on purpose.
_MONO_OK = {
    'è', 'dà', 'dì', 'là', 'lì', 'né', 'sé', 'sì', 'tè',
    'ciò', 'già', 'giù', 'più', 'può', 'cioè', 'ahimè', 'piè',
}
_VGROUP = re.compile(r'[aeiouàáèéìíòóùúy]+', re.I)


def destress(s):
    """Italian spelling, from a Wiktionary form.

    An accent survives only where it sits on the final letter of its own token,
    which is where Italian orthography actually writes one.  Applied per token
    rather than per string, because a form may be several words -- a reflexive's
    `mi chiàmo` is `mi chiamo`, and `si sarà` keeps the à it ends on.

    **A TOKEN ENDING IN AN APOSTROPHE KEEPS NO ACCENT AT ALL**, which is the one
    exception and was found by the index assertion in `examples.py` rather than
    by eye.  An apostrophe marks an ELISION or a TRUNCATION, and Italian writes
    the accent only on a word that ends on its own stressed vowel: the truncated
    imperatives are `fa'`, `va'`, `da'`, `di'`, `sta'`, never `fà'`.  Wiktionary
    writes them accented because it is marking the stress, as it does
    everywhere; the apostrophe is what says the vowel is not really final.
    """
    if not s:
        return s
    out = []
    for tok in s.split(' '):
        if not tok:
            out.append(tok)
            continue
        if tok[-1] in _APOS:
            out.append(tok.translate(_STRESS))
            continue
        head, last = tok[:-1].translate(_STRESS), tok[-1]
        # a final accent survives only on a word of more than one syllable, or
        # on one of the monosyllables Italian actually writes accented
        if last != last.translate(_STRESS):
            whole = head + last
            if len(_VGROUP.findall(whole)) < 2 and whole.lower() not in _MONO_OK:
                last = last.translate(_STRESS)
        out.append(head + last)
    return ' '.join(out)


def fold(s):
    """A form reduced to bare letters, for matching rather than for showing."""
    s = destress(s or '').lower()
    s = unicodedata.normalize('NFD', s)
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


# ---------------------------------------------------------------- articles

VOWELS = 'aeiouàáèéìíòóùú'

# The environments a masculine noun takes `lo` / `gli` in rather than `il` / `i`.
# It is one phonological class -- a cluster Italian will not put a bare `il`
# in front of -- and it is written out here rather than reasoned about at the
# call site.
_LO_RX = re.compile(
    r'''^(?:
          s(?![aeiouàáèéìíòóùú])   # s + consonant: studente, sbaglio, scuola, spesa
        | z                        # zio, zaino, zucchero
        | gn                       # gnocco
        | ps | pn                  # psicologo, pneumatico
        | x                        # xilofono
        | y                        # yogurt
        | i(?=[aeiouàáèéìíòóùú])   # semiconsonantal i: iodio, iato
        | j                        # jazz, juventino
      )''',
    re.I | re.X)


def _vowel_initial(w):
    """Whether the article elides before this word.

    An initial `h` is silent in Italian, so `hotel` behaves as a vowel-initial
    word throughout: `l'hotel`, `gli hotel`.
    """
    w = (w or '').lstrip("'’")
    if not w:
        return False
    if w[0].lower() == 'h' and len(w) > 1 and w[1].lower() in VOWELS:
        return True
    return w[0].lower() in VOWELS


def article(word, gender, plural=False):
    """The definite article this word takes: il / lo / l' / la, i / gli / le.

    `gender` is 'm' or 'f'; anything else returns '' rather than a guess, since
    a noun whose gender the dictionary does not state is a noun whose article
    cannot be derived.
    """
    if gender not in ('m', 'f') or not word:
        return ''
    w = word.strip()
    if gender == 'f':
        if plural:
            return 'le'                      # never elides
        return "l'" if _vowel_initial(w) else 'la'
    if plural:
        return 'gli' if (_vowel_initial(w) or _LO_RX.match(w)) else 'i'
    if _vowel_initial(w):
        return "l'"
    return 'lo' if _LO_RX.match(w) else 'il'


def with_article(word, gender, plural=False):
    """`la casa`, `lo studente`, `l'amico` -- elision closes the space up."""
    art = article(word, gender, plural)
    if not art:
        return word
    return art + word if art.endswith(("'", '’')) else f'{art} {word}'


def indefinite(word, gender):
    """`un` / `uno` / `una` / `un'`.

    Masculine `un` does NOT take an apostrophe before a vowel (`un amico`) and
    feminine `un'` does (`un'amica`) -- the single most-corrected apostrophe in
    Italian, and worth showing for that reason alone.
    """
    if gender not in ('m', 'f') or not word:
        return ''
    w = word.strip()
    if gender == 'm':
        return 'uno' if (_LO_RX.match(w) and not _vowel_initial(w)) else 'un'
    return "un'" if _vowel_initial(w) else 'una'


# ------------------------------------------------------- regular inflection

def agree(participle, gender, plural):
    """A past participle or an -o adjective made to agree.

    Only the regular `-o` class is derived: `andato` gives andata / andati /
    andate.  Anything else is returned unchanged rather than guessed at, which
    is what keeps a form the dictionary did not state off the card.
    """
    if not participle or not participle.endswith('o'):
        return participle
    stem = participle[:-1]
    if not plural:
        return stem + ('a' if gender == 'f' else 'o')
    return stem + ('e' if gender == 'f' else 'i')


def adj_forms_regular(word):
    """The four forms of a regular adjective, or None where the class is not one.

    `-o` gives four distinct forms and `-e` gives two; everything else -- an
    invariable like `blu`, an `-a` adjective like `ottimista`, and every
    spelling change (`bianco` → `bianchi`, `lungo` → `lunghi`) -- returns None
    and is left to whatever the dictionary states.  Deriving `-co` and `-go`
    here would be inventing a plural that is right about twice in three, which
    is the wrong side of a bad bet on a card.
    """
    if not word or len(word) < 3:
        return None
    stem, end = word[:-1], word[-1]
    if end == 'o':
        # -co / -go / -cio / -gio all change spelling in the plural; refuse them
        if word[-3:-1] in ('ci', 'gi') or word[-2] in ('c', 'g'):
            return None
        return {'f': stem + 'a', 'mp': stem + 'i', 'fp': stem + 'e'}
    if end == 'e':
        if word[-2] in ('c', 'g'):
            return None
        return {'f': word, 'mp': stem + 'i', 'fp': stem + 'i'}
    return None


# ------------------------------------------------------------------ tidy

def clean_form(s):
    """A form as it should be printed: destressed, trimmed, apostrophe normalised."""
    s = destress((s or '').strip())
    return s.replace('’', "'")
