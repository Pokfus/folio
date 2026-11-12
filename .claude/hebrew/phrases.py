#!/usr/bin/env python3
"""The phrases deck's expressions: Hebrew set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.

Persian's phrases deck (`.claude/persian/phrases.py`), carried over.  Not a CEFR
level: an expression is a unit a frequency list of words cannot see.  Three
subdecks (`docs/lang-decks.md`, "THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`תודה רבה`, `על לא דבר`, `מה פתאום`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`ענבים חמוצים`, `בדם קר`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`hebrew_level.words_below`, on the
word and its pointing), and every sense goes through the level decks' filters:
a weak sense (rare, Biblical, archaic ...) is not a reason to include an
expression, a template (`יש ל־ …`) is not an expression, and `EXCLUDE` names the
rest, each with its reason.

THE ORDER is how many of Tatoeba's Hebrew sentences contain the expression,
word for word (a prefix chain allowed on its first word: `ובוקר טוב`), then the
expression's own frequency estimate (`extract.py`), then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold, strips
from hebrew_level import LEVEL, f, words_below
from choose import choose
import examples

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'


def _select():
    # `select` is also a standard-library module, so the level stage's lists are loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('hebrew_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase', 'adv_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'adv_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.  Read off the first ranking (2026-11-12).
EXCLUDE = {
    'אני רעב': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני רעבה': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'יש לי שאלה': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני לא מדבר אנגלית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני לא מדברת אנגלית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני לא מדבר עברית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני לא מדברת עברית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני טבעוני': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני טבעונית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני זקוק למתורגמן': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני צריכה מפה של העיר': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני צריך להזמין מונית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'אני צריכה להזמין מונית': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'איך מגיעים לשדה התעופה': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'איך מגיעים לתחנת הרכבת': 'a phrasebook sentence built from level words, not a set phrase (the Persian rule)',
    'פועלי כל העולם התאחדו': 'a political slogan (the Persian rule for slogans)',
    'עם ישראל חי': 'a political slogan',
    'שם פס': 'its gloss is vulgar',
    'הוציא להורג': 'to execute: the level decks leave killing out',
    'היהפוך כושי עורו': 'contains an ethnic slur',
    'צפרא טבא': 'an Aramaic greeting, not everyday Hebrew',
    'רמשא טבא': 'an Aramaic greeting, not everyday Hebrew',
    'תנו רבנן': 'a Talmudic formula in Aramaic',
    'קריינא דאיגרתא איהו ליהוי פרוונקא': 'a Talmudic saying in Aramaic',
    'די לחכימא ברמיזא': 'a Talmudic saying in Aramaic',
    'כי בתחבלות תעשה לך מלחמה': 'Wiktionary\u2019s pointing splits a word in two and its reading is Biblical; a verse of Proverbs, not a saying',
    'חתיכה נעשית נבילה': 'a term of kashrut law, not an everyday phrase',
    'שאל בני ונען': 'a liturgical line, not an everyday phrase',
    'יהודה ועוד לקרא': 'a Talmudic formula',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or '־' in L['word'] or k[0] == '-' or k[-1] == '-':
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags and e['pos'] in IDIOM_POS:
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
    below_words = {b.split('|')[0] for b in below}
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        L = lex[k]
        if L['word'] in below_words or k in excl or any(w in swears for w in k.split()):
            continue
        p = choose(L, pos)[0]['p']
        rows.append({'key': k, 'pick': p, 'word': L['word'], 'freq': L['freq'], 'pos': pos,
                     'source': 'phrases', 'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression, word for word: the sentences holding its
    # SECOND word (never prefixed) are the only candidates, so the count is an index lookup, not a scan
    from he import tokens
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(s)] for _, s, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words = fold(r['word']).split()
        n, k = 0, len(words)
        for i in index.get(words[1], []):
            ft = toks[i]
            for j in range(len(ft) - k + 1):
                first = ft[j]
                if (first == words[0] or words[0] in strips(first)) and ft[j + 1:j + k] == words[1:]:
                    n += 1
                    break
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
