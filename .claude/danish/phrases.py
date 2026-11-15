#!/usr/bin/env python3
"""The phrases deck's expressions: Danish set phrases, particle verbs, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  The Hindi arrangement
(`.claude/hindi/phrases.py`) as Swedish's (`.claude/swedish/phrases.py`) has it, with
its fourth subdeck:

  Phrases         an expression of more than one word that Wiktionary files as
                  a phrase or an interjection and does NOT tag idiomatic --
                  mostly the everyday formulas (`god bedring`, `mange tak`);
  Particle verbs  a verb of more than one word whose senses are NOT tagged
                  idiomatic -- the verb-and-particle units Danish is built on
                  (`blive ved`, `bryde sammen`, `bestå af`), whose meaning a
                  learner cannot read off the verb;
  Idioms          an expression of more than one word with a sense Wiktionary
                  TAGS idiomatic (`male fanden på væggen`);
  Proverbs        Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a particle
verb outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`danish_level.words_below`), and
every sense goes through the level decks' filters: a weak sense (rare,
dialectal, archaic ...) or a slang one is not a reason to include an
expression, a template ("... år gammal") is not an expression, and `EXCLUDE`
names the rest, each with its reason.

THE ORDER, within a subdeck, is how many of Tatoeba's Danish sentences contain
the expression -- a particle verb counted with its verb in any form
(`examples.phrase_parts`) -- then the expression's own frequency estimate
(`extract.py`), then its spelling.  CAPS keeps the two long subdecks to the
commonest.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from da import fold, tokens
from danish_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('danish_select',
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

# Never taught, whatever the source says.  Each line says why.  Read off the deck (2026-11-15).
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Hindi, Turkish and Swedish rule): a personal
    # statement a learner builds from the level decks' words.  The formulas asked and answered
    # whole (hvordan har du det, hvad hedder du, hvor er toilettet, jeg forstår ikke) stay.
    'jeg elsker dig': 'a personal sentence', 'jeg er sulten': 'a personal sentence',
    'jeg er tørstig': 'a personal sentence', 'jeg har feber': 'a personal sentence',
    'jeg har et spørgsmål': 'a personal sentence', 'tror du på gud': 'a personal sentence',
    'jeg er ikke religiøs': 'a personal sentence', 'jeg har brug for en advokat': 'a personal sentence',
    'jeg er forelsket i dig': 'a personal sentence', 'jeg taler ikke engelsk': 'a personal sentence',
    'er du allergisk over for noget medicin': 'a phrasebook sentence',
    # A POINTER, NOT A MEANING ("synonym of …")
    'blæse på': 'its gloss is "synonym of skide på"', 'tro om': 'its gloss is a pointer to tro om igen',
    'jokke i spinaten': 'its gloss is a pointer to træde i spinaten',
    # THE SAME EXPRESSION TWICE: the commoner spelling is taught
    'fra børn og fulde folk skal man høre sandheden': 'af børn og fulde folk … is taught',
    'vejen til mandens hjerte går gennem maven': 'vejen til en mands hjerte … is taught',
    'tyv tror hvermand stjæler': 'tyv tror hver mand stjæler is taught',
    'hvile på sine laurbær': 'hvile på laurbærrene is taught', 'ude hvor kragerne vender': 'hvor kragerne har vendt is taught',
    'sætte en kæp i hjulet': 'stikke en kæp i hjulet is taught', 'bag skyerne er himlen altid blå': 'over skyerne … is taught',
    'non bis in idem': 'Latin, and the second spelling',
    # ENGLISH OR LATIN, OR A TECHNICAL TERM RATHER THAN A PHRASE
    'never mind': 'English', 'you name it': 'English', 'fit for fight': 'English', 'no problemo': 'mock Spanish',
    'no offense': 'English', 'no homo': 'English slang', 'oder was': 'German', 'et tu': 'Latin',
    'ne bis in idem': 'a Latin legal maxim', 'sat sapienti': 'Latin', 'in vino veritas': 'Latin',
    'fonetisk alfabet': 'a technical term', 'siderisk år': 'a technical term', 'min kursivering': 'an editorial note',
    # RUDE, SEXUAL OR CRUDE, OR AN OATH
    'hold kæft': 'rude ("shut up")', 'holde kæft': 'rude ("shut up")', 'kors i røven': 'crude', 'krudt i røven': 'crude',
    'røven i vandskorpen': 'crude', 'lokummet brænder': 'crude', 'tisse i bukserne for at holde varmen': 'crude',
    'tisse på nogens sukkermad': 'crude', 'for dælen': 'an oath', 'hvad dælen': 'an oath',
    'det sagde hun også i går': 'a sexual joke', 'være sammen': 'its only sense is sexual',
    'have sted': 'sexual', 'gå i seng med': 'sexual', 'spille den af': 'sexual', 'spille den af på': 'sexual',
    'få noget på den dumme': 'sexual', 'snakke trusserne af': 'sexual', 'rive den af': 'sexual',
    'tænde på': 'its sense is sexual', 'seksuel ydelse': 'sexual',
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
    toks = [[fold(t) for t in tokens(da)] for _, da, _ in pairs]
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
