#!/usr/bin/env python3
"""The phrases deck's expressions: Bulgarian set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with one more field, `sub`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  The three subdecks of
the Indonesian, Turkish and Hindi arrangement (`docs/lang-decks.md`, "THE
PHRASES DECK"), and a fourth that Bulgarian needs:

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`за съжале́ние`, `ня́ма защо́`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`и́мам предви́д`, `да́вам си смéтка`);
  Proverbs  Wiktionary's part of speech `proverb`.
  Verbs with се   a REFLEXIVE VERB Wiktionary enters under its own headword
            (`боя́ се` "to be afraid", `надя́вам се` "to hope", `сме́я се` "to
            laugh") -- a word a learner needs whose meaning is often not the
            plain verb's, and which the level decks, dealing single words, never
            reach.

WIKTIONARY TAGS FEW BULGARIAN IDIOMS (eighteen), so an Idiom is also a verb
phrase with an object (`бера́ душа́` "to be on one's deathbed", `ям бой` "to
take a beating"), and a Phrase also a multi-word adverb, conjunction or
preposition (`като́ цяло`, `ка́мо ли`, `без о́глед на`).

One subdeck per expression: a proverb outranks an idiom outranks a reflexive
verb outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`bulgarian_level.words_below`),
and every sense goes through the level decks' filters: a weak sense (rare,
dialectal, pre-1945, vulgar ...) is not a reason to include an expression,
a template ("... ро́ків") is not an expression, and `EXCLUDE` names the rest,
each with its reason.

THE ORDER is how many of Tatoeba's Bulgarian sentences contain the
expression -- its verb counted in any form of that verb (`examples.py`'s
matching for this deck) -- then the expression's own frequency estimate
(`extract.py`), then its spelling.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bg import fold, tokens, NOT_BG
from bulgarian_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's lists are loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('bulgarian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Verbs with се', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase', 'adv', 'conj', 'prep', 'det'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}
FORM_GLOSS = re.compile(r'participle of|^definite (subject|object)|form of|^(only used in|see) |'
                        r'-person (singular|plural) .* of ')
# A reflexive verb the subtitles all but never use (`ку́рлуя се`, `ко́тя се`) is left out: the
# subdeck is for the reflexives a learner meets.
REFLEXIVE_FLOOR = 10

# Never taught, whatever the source says.  Each line says why.  Read off the first build.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Turkish, Hindi and Ukrainian rule): a sentence a
    # learner builds from the level decks, or a template, is not one to learn whole
    'не знам': 'a sentence built from level words ("I don\'t know"), not a set phrase',
    'не разбирам': 'a sentence built from level words ("I don\'t understand")',
    'дайте ми': 'a template ("give me ..."), not an expression',
    'говорите ли английски': 'a sentence built from level words ("do you speak English?")',
    'аз съм атеист': 'a personal sentence built from level words',
    'аз съм българин': 'a personal sentence built from level words',
    'аз съм българка': 'a personal sentence built from level words',
    'имате ли нужда от помощ': 'a sentence built from level words ("do you need help?")',
    'имаш ли нужда от помощ': 'a sentence built from level words ("do you need help?")',
    'имам въпрос': 'a sentence built from level words ("I have a question")',
    # not usable as a card
    'ролите озвучиха артистите': "the subtitle files' own credit line ('the roles were voiced by')",
    'в превод': 'a note on how a foreign name is glossed in writing, not an expression',
    'силния на деня': 'a calque Wiktionary glosses only word for word',
    'Честито Рождество Христово': 'the long form of Честито Рождество, which is taught',
    # religious honorifics and a political salute (the Hindi and Ukrainian rule); the festival
    # greetings stay
    'алейхис селям': 'a religious honorific',
    'саллеллаху алейхи ве селлем': 'a religious honorific',
    'зиг хайл': 'the Nazi salute',
}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not FORM_GLOSS.search(g['g'])]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or k[0] == '-' or k[-1] == '-' or NOT_BG.search(k):
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            words = k.split()
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags and e['pos'] in IDIOM_POS:
                sub = 'Idioms'
            elif e['pos'] == 'verb' and len(words) == 2 and words[1] == 'се':
                sub = 'Verbs with се'
            elif e['pos'] == 'verb' and words[-1] not in ('се', 'си'):
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
        if sub == 'Verbs with се' and L['freq'] < REFLEXIVE_FLOOR:
            continue
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(s)] for _, s, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words, alts = examples.phrase_parts(r, lex)
        hits = set()
        for fm in alts[0]:
            for i in index.get(fm, []):
                if i not in hits and examples.seq_hit(toks[i], words, alts):
                    hits.add(i)
        r['count'] = len(hits)
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
