#!/usr/bin/env python3
"""The phrases deck's expressions: Persian set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.

Hindi's phrases deck (`.claude/hindi/phrases.py`, 2026-11-12), carried over.
Not a CEFR level: an expression is a unit a frequency list of words cannot see,
which is why the level decks teach so few of them.  Three subdecks, the
Indonesian and Turkish arrangement (`docs/lang-decks.md`, "THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`خسته نباشید`, `دستت درد نکنه`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic;
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`persian_level.words_below`), and
every sense goes through the level decks' filters: a weak sense (rare,
dialectal, Classical, Dari ...) is not a reason to include an expression, a
template ("... ساله") is not an expression, and `EXCLUDE` names the rest, each
with its reason.

THE ORDER is how many of Tatoeba's Persian sentences contain the expression --
its last word counted in any form when that word is a verb, as `examples.py`
matches every multi-word entry -- then the expression's own frequency estimate
(`extract.py`), then its spelling.  Tatoeba's Persian is small, so most
expressions are found in no sentence and the second key does most of the
ordering; the description says so.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold
from persian_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's lists are loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('persian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.  Read off the first
# ranking (2026-11-12).
EXCLUDE = {
    'کجا زندگی می\u200cکنی': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'کجا زندگی می\u200cکنید': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'یک سؤال دارم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'یک پرسش دارم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'می\u200cخوام بدونم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'کمک می\u200cخوای': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'به کمک احتیاج داری': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'به کمک احتیاج دارید': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'به کمک شما احتیاج دارم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'به کمکت احتیاج دارم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'به خدا اعتقاد داری': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'به خدا اعتقاد دارید': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'دکتر می\u200cخواهم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'سرما خوردم': 'a phrasebook sentence built from level words, not a set phrase (the Hindi and Turkish rule)',
    'انگلیسی بلد نیستم': 'a personal statement built from level words, not a set phrase',
    'فارسی بلد نیستم': 'a personal statement built from level words, not a set phrase',
    'گی هستم': 'a personal statement built from level words, not a set phrase',
    'کور هستم': 'a personal statement built from level words, not a set phrase',
    'کر هستم': 'a personal statement built from level words, not a set phrase',
    'مذهبی نیستم': 'a personal statement built from level words, not a set phrase',
    'مسیحی هستم': 'a personal statement built from level words, not a set phrase',
    'مسلمان هستم': 'a personal statement built from level words, not a set phrase',
    'بهائی هستم': 'a personal statement built from level words, not a set phrase',
    'من ایرانی هستم': 'a personal statement built from level words, not a set phrase',
    'خبر نبودم': 'a personal statement built from level words, not a set phrase',
    'دل می\u200cباله ترا': 'a Dari spelling of "I love you"; the deck teaches دوستت دارم',
    'مرگ بر': 'a political slogan (the Hindi and Turkish rule for slogans)',
    'مرگ بر اسرائیل': 'a political slogan',
    'زن، زندگی، آزادی': 'a political slogan',
    'اندیشه نیک، گفتار نیک، کردار نیک': 'a religious motto (Zoroastrian), not an everyday phrase',
    'وسیع باش و تنها و سر به زیر و سخت': 'a line of one poem (Sohrab Sepehri), not a set phrase',
    'رحمت الله علیه': 'an Arabic religious formula (the Hindi rule)',
    'علیه السلام': 'an Arabic religious formula',
    'علیها السلام': 'an Arabic religious formula',
    'صلی الله علیه وسلم': 'an Arabic religious formula',
    'انا لله و انا الیه راجعون': 'a Quranic verse in Arabic',
    'الله أبهی': 'a Baháʼí greeting in Arabic',
    'سه کاف': 'about vulgar words',
    'پشمام ریخت': 'vulgar slang',
    'قربانت بشوم': 'a variant of قربونت برم (taught), defined by a pointer',
    'فدایت بشوم': 'a variant of قربونت برم (taught), defined by a pointer',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or '-' == k[0] or '-' == k[-1]:
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
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or any(w in swears for w in k.split()):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression, matched as examples.py matches
    pairs = examples.load()
    toks = [examples.ftoks(s) for _, s, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words = fold(r['word']).split()
        last = lex.get(words[-1])
        lastf = examples.forms_of(last, 'verb') if last else {words[-1]}
        lastf.add(words[-1])
        n, k = 0, len(words)
        for i in index.get(words[0], []):
            ft = toks[i]
            if any(ft[j:j + k - 1] == words[:-1] and ft[j + k - 1] in lastf
                   for j in range(len(ft) - k + 1)):
                n += 1
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
