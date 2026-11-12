#!/usr/bin/env python3
"""The phrases deck's expressions: Vietnamese set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  Three subdecks, the
Hindi, Indonesian and Turkish arrangement (`docs/lang-decks.md`, "THE PHRASES
DECK"):

  Phrases   an expression of more than one syllable-word that Wiktionary files
            as a phrase or an interjection and does NOT tag idiomatic -- mostly
            the everyday formulas (`chào buổi sáng`, `hẹn gặp lại`);
  Idioms    an expression with a sense Wiktionary TAGS idiomatic, whatever its
            part of speech (`ăn miếng trả miếng`, `nước mắt cá sấu`) -- the
            four-syllable thành ngữ are most of them;
  Proverbs  Wiktionary's part of speech `proverb` (`thùng rỗng kêu to`).

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

A SPACE IS A SYLLABLE, so "more than one word" cannot be read off the spaces:
`học sinh` has a space and is one word.  What makes a row an expression here is
Wiktionary's part of speech or its idiomatic tag, never the space -- a noun like
`thẻ tín dụng` is in the dump, multi-syllable and not an expression.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`vietnamese_level.words_below`),
and every sense goes through the level decks' filters: a weak sense (rare,
dialectal, vulgar ...) is not a reason to include an expression, Wiktionary's
sum-of-parts note ("Used other than figuratively or idiomatically: see ...") is
not a meaning, any expression containing one of the levels' SWEARS is left out,
and `EXCLUDE` names the rest, each with its reason.

THE ORDER is how many of Tatoeba's Vietnamese sentences contain the expression
(syllable for syllable, on word boundaries), then the subtitle count
`extract.py` made for it (an expression up to four syllables is a segment there;
a longer one has no count), then its spelling.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vi import fold, tokens, fold_syl
from vietnamese_level import LEVEL, f, words_below
import examples

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('viet_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


_S = _select()
SWEARS = _S.SWEARS

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj'}
SUM_OF_PARTS = 'Used other than figuratively or idiomatically'
VIET = re.compile(r'^[a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ ]+$',
                  re.I)

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # read off the deck (2026-11-12)
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Hindi and Turkish rule): a sentence a learner
    # builds from the level decks' words, in one person, is not an expression to learn whole
    'anh yêu em': 'a phrasebook sentence ("I love you", man to woman), built from A1 words',
    'em yêu anh': 'a phrasebook sentence ("I love you", woman to man), built from A1 words',
    'tôi là người Việt': 'a phrasebook sentence ("I am Vietnamese")',
    'tôi có một câu hỏi': 'a phrasebook sentence ("I have a question")',
    'cái này là gì': 'a phrasebook sentence ("what is this?")',
    'cần lời giải thích': 'a phrasebook sentence ("I need an explanation")',
    # slogans (the Turkish rule)
    'từ sông ra biển': 'a political slogan, not a set phrase of the language',
    # swears, curses and slurs, as in the level decks
    'đụ mẹ': 'a swear', 'chó đểu': 'a swear and an insult', 'quỷ tha ma bắt': 'a curse ("goddamn")',
    'trời đánh': 'glossed "goddamn" first; trời đánh thánh vật says the same without it',
    'cái búa': 'rude ("my ass")', 'cái con khỉ': 'rude ("my ass")',
    'gái bán hoa': 'a slur for a prostitute', 'gái đứng đường': 'a slur for a prostitute',
    'ái nam ái nữ': 'Wiktionary glosses it with a dated and hurtful sense of "intersex"',
    'rỗng như đít Bụt': 'crude (đít, "arse"), which the level decks leave out',
    # Wiktionary's gloss is a template left unexpanded
    'đáng đời': 'its gloss is an unexpanded template ("serves objective case pronouns right")',
    'đáng kiếp': 'its gloss is an unexpanded template ("serves objective case pronouns right")',
    # a spelling of a word the levels teach, or a regional form
    'a men': 'a spelling of amen, which B2 teaches',
    'trầu quơ': 'the Bình Định form of trời ơi, which B1 teaches',
    # VARIANT SPELLINGS OF ONE INTERJECTION: the deck keeps the commonest and drops the rest,
    # rather than labelling five cards "not ..., not ..." (an idiom's or a proverb's alternate
    # WORDING is kept, labelled -- it is a different saying, not a spelling)
    'ạ ơi': 'a spelling of à ơi', 'ái dà': 'a spelling of ái chà', 'bính bong': 'a spelling of bính boong',
    'vân vân và mây mây': 'a longer form of vân vân mây mây', 'chèng ơi': 'a form of mèng ơi',
    'chèng đéc ơi': 'a form of mèng ơi', 'mèng đéc ơi': 'a form of mèng ơi',
    'cục ta cục tác': 'a longer form of cục tác', 'ác một cái là': 'a longer form of ác cái là',
    'ụt ịt': 'a second spelling of the pig\'s oink, ủn ỉn',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not g['g'].startswith(SUM_OF_PARTS)]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if not VIET.match(L['word']):
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags:
                sub = 'Idioms'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            rank = ORDER.index(sub)
            if k not in rows or rank > rows[k][1]:
                rows[k] = (sub, rank, e['pos'])
    return rows


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    # a spelling the levels teach under its other form is taught (the levels' own rule)
    below |= {L['alt_of'] for k, L in lex.items() if k in below and 'alt_of' in L}
    below |= {k for k, L in lex.items() if L.get('alt_of') in below}
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE} | {fold(s) for s in _S.EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or any(s in k for s in swears if ' ' in s) \
                or any(w in swears for w in k.split()):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos, 'source': 'phrases', 'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression, on syllable boundaries
    pairs = examples.load()
    sents = [[fold_syl(t) for t in tokens(v)] for _, v, _ in pairs]
    index = {}
    for i, syl in enumerate(sents):
        for t in set(syl):
            index.setdefault(t, []).append(i)
    for r in rows:
        words = r['key'].split()
        n, c = len(words), 0
        for i in index.get(words[0], []):
            syl = sents[i]
            if any(syl[j:j + n] == words for j in range(len(syl) - n + 1)):
                c += 1
        r['count'] = c
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
