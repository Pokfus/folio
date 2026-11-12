#!/usr/bin/env python3
"""The phrases deck's expressions: Swedish set phrases, particle verbs, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  The Hindi arrangement
(`.claude/hindi/phrases.py`), with one subdeck Swedish needs that Hindi did not:

  Phrases         an expression of more than one word that Wiktionary files as
                  a phrase or an interjection and does NOT tag idiomatic --
                  mostly the everyday formulas (`hur mår du`, `ha det bra`);
  Particle verbs  a verb of more than one word whose senses are NOT tagged
                  idiomatic -- the verb-and-particle units Swedish is built on
                  (`ta hand om`, `komma överens`, `hålla på`), whose meaning a
                  learner cannot read off the verb;
  Idioms          an expression of more than one word with a sense Wiktionary
                  TAGS idiomatic (`ana ugglor i mossen`);
  Proverbs        Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a particle
verb outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`swedish_level.words_below`), and
every sense goes through the level decks' filters: a weak sense (rare,
dialectal, archaic ...) or a slang one is not a reason to include an
expression, a template ("... år gammal") is not an expression, and `EXCLUDE`
names the rest, each with its reason.

THE ORDER, within a subdeck, is how many of Tatoeba's Swedish sentences contain
the expression -- a particle verb counted with its verb in any form
(`examples.phrase_parts`) -- then the expression's own frequency estimate
(`extract.py`), then its spelling.  CAPS keeps the two long subdecks to the
commonest: Wiktionary lists over a thousand Swedish multi-word verbs, most of
them rare.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sv import fold, tokens
from swedish_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('swedish_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Particle verbs', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}
CAPS = {'Phrases': 200, 'Particle verbs': 300, 'Idioms': 250, 'Proverbs': 100}
NOT_A_REASON = {'slang'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Hindi and Turkish rule): a personal statement
    # a learner builds from the level decks' words.  The formulas a traveller asks and answers
    # whole (hur mår du, vad heter du, var är toaletten, jag förstår inte) stay.
    'det är': '"that is", built from A1 words', 'jag är hungrig': 'a personal sentence',
    'jag älskar dig': 'a personal sentence', 'jag hatar dig': 'a personal sentence',
    'jag hatar er': 'a personal sentence', 'jag är kär i dig': 'a personal sentence',
    'tror du på Gud': 'a personal sentence', 'jag är inte religiös': 'a personal sentence',
    'jag behöver en läkare': 'a personal sentence', 'jag är tjugo år': 'a template ("I am N years old")',
    'är du allergisk mot någon medicin': 'a phrasebook sentence', 'jag behöver din hjälp': 'a personal sentence',
    'jag har en fråga': 'a personal sentence', 'behöver du hjälp': 'a personal sentence',
    'tack för din hjälp': 'a personal sentence', 'pappa betalar': 'a personal sentence',
    # A POINTER, NOT A MEANING ("See ta sig"), OR NO GLOSS THE EXTRACT KEEPS
    'ta dig': 'its gloss is "See ta sig"', 'ta dig i häcken': 'its gloss is a pointer',
    'ta dig i brasan': 'its gloss is a pointer', 'vete fasen': 'its gloss is a pointer',
    'håll käft': 'no gloss the extract keeps, and rude', 'knip käft': 'no gloss the extract keeps, and rude',
    'få fötter': 'its gloss is garbled', 'gå till': 'its gloss says it is not a particle verb',
    'köra över': 'its gloss says it is not a particle verb', 'fått på halsen': 'a participle, not the expression',
    'av sig': 'not an expression on its own', 'du är': 'a call in the game of tag',
    'ska bara': 'not an expression on its own',
    # THE SAME EXPRESSION TWICE: the commoner spelling is taught
    'trevligt att råkas': 'trevligt att träffas is taught', 'sov så gott': 'sov gott is taught',
    'har den äran': 'ha den äran is taught', 'ha det': 'a fragment of ha det bra, ha det gott',
    'kasta pärlor åt svin': 'kasta pärlor för svinen is taught', 'kasta pärlor åt svinen': 'kasta pärlor för svinen is taught',
    'först till kvarn får först mala': 'först till kvarn is taught', 'ha blod på sina händer': 'ha blod på händerna is taught',
    'se mellan fingrarna': 'se genom fingrarna is taught', 'intet nytt under solen': 'inget nytt under solen is taught',
    'det är mänskligt att fela': 'att fela är mänskligt is taught', 'envar är sin egen lyckas smed': 'var och en är sin egen lyckas smed is taught',
    'många bäckar små gör en stor å': 'många bäckar små blir en stor å is taught',
    'du har satt din sista potatis': 'ha satt sin sista potatis is taught',
    # RUDE, SEXUAL, DRUGS, OR NOT A PHRASE A LEARNER NEEDS
    'håll truten': 'rude', 'håll klaffen': 'rude', 'skitsamma vilket': 'a swear', 'gå och dö': 'an insult',
    'dra åt skogen': 'rude ("piss off")', 'runt ord': 'vulgar', 'ligga med': 'sexual', 'röka på': 'drugs',
    'hell seger': 'the Nazi salute', 'sätta ner': 'its sense is "to curse (someone)"',
    'lagar ni så äter vi': 'a mnemonic for four rivers in Halland', 'med hand på penna': 'a legal term',
    'bostad först': 'the name of a housing policy', 'lägg ägg': 'rare',
    'grått nytt hår': 'a pun on gott nytt år', 'yes box': 'slang', 'vacker tass': 'said to a dog',
    'ett skepp kommer lastat': 'the name of a children\'s game', 'knip näbb': 'rude',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not (set(g['tags']) & NOT_A_REASON)]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or k[0] == '-' or k[-1] == '-':
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
            elif e['pos'] == 'verb':
                sub = 'Particle verbs'
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
                     'pos': pos, 'source': 'phrases', 'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(sv)] for _, sv, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        first, rest = examples.phrase_parts(r, lex)
        n = 0
        seen = set()
        for fm in first:
            for i in index.get(fm, []):
                if i not in seen and examples.seq_hit(toks[i], first, rest):
                    seen.add(i)
                    n += 1
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    kept, have = [], {s: 0 for s in ORDER}
    for r in rows:
        if have[r['sub']] < CAPS[r['sub']]:
            have[r['sub']] += 1
            kept.append(r)
    json.dump(kept, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(kept)} expressions kept of {len(rows)}: ' +
          ', '.join(f'{have[s]} of {by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in kept if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
