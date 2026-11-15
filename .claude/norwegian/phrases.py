#!/usr/bin/env python3
"""The phrases deck's expressions: Norwegian set phrases, fixed expressions, particle verbs,
idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the shape
`select.py` writes for a level, with two more fields, `sub` and `count`.  Swedish's
arrangement (`.claude/swedish/phrases.py`), with ONE SUBDECK SWEDISH DID NOT HAVE:

  Phrases            an expression of more than one word that Wiktionary files as a
                     phrase or an interjection and does NOT tag idiomatic -- mostly the
                     everyday formulas (`god morgen` is A1's; `god bedring`, `ha det bra`);
  Fixed expressions  a multi-word ADVERB, PREPOSITION or CONJUNCTION (`av og til` is
                     A1's; `på grunn av`, `i stedet for`, `til og med`, `med andre ord`):
                     the little units Norwegian builds sentences from, which a word list
                     cannot see.  Swedish's extract filed fewer of these and its deck did
                     not take them; the Bokmål extract has more of them than it has
                     particle verbs.  Latin, Italian and French loans (`a priori`,
                     `a cappella`, `à jour`) are not taught (`FOREIGN`);
  Particle verbs     a verb of more than one word whose senses are NOT tagged idiomatic
                     (`finne ut`, `gi opp`, `kaste opp`);
  Idioms             an expression of more than one word with a sense Wiktionary TAGS
                     idiomatic (`bite i gresset`);
  Proverbs           Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a particle verb outranks
a fixed expression outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`norwegian_level.words_below`), and every
sense goes through the level decks' filters: a weak sense (rare, dialectal, archaic ...)
or a slang one is not a reason to include an expression, a template is not an
expression, and `EXCLUDE` names the rest, each with its reason.

THE ORDER, within a subdeck, is how many of Tatoeba's Norwegian sentences contain the
expression -- a particle verb counted with its verb in any form (`examples.phrase_parts`)
-- then the expression's own frequency estimate (`extract.py`), then its spelling.  The
Bokmål extract is small enough that no subdeck needs a cap; `CAPS` is kept as the knob.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nb import fold, tokens
from norwegian_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('norwegian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Fixed expressions', 'Particle verbs', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
FIXED_POS = {'adv', 'prep', 'conj'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj', 'prep', 'conj'}
CAPS = {'Phrases': 250, 'Fixed expressions': 250, 'Particle verbs': 250, 'Idioms': 250,
        'Proverbs': 100}
NOT_A_REASON = {'slang'}

# Loans written in their own language, which Wiktionary files as Bokmål adverbs because
# Norwegian prose uses them: not Norwegian expressions a learner of the language needs.
LOAN_START = {'a', 'ad', 'à', 'al', 'in', 'pro', 'sub', 'post', 'ex'}
FOREIGN = {'prima', 'tempo', 'cappella', 'battuta', 'priori', 'posteriori', 'fortiori', 'dato',
           'due', 'konto', 'verbo', 'hoc', 'jour', 'undas', 'domini', 'anno', 'facto', 'vice',
           'versa', 'vitae', 'fit', 'fight', 'bloc', 'passant', 'grosso', 'modo', 'bona', 'fide',
           'quo', 'sic', 'cetera', 'non', 'grata', 'vu', 'deja', 'déjà', 'the', 'of', 'and'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Hindi, Turkish and Swedish rule): a personal
    # statement a learner builds from the level decks' words.  The formulas asked and answered
    # whole (jeg vet ikke, jeg forstår ikke, hvordan går det, snakker du engelsk) stay.
    'jeg elsker deg': 'a personal sentence', 'jeg er sulten': 'a personal sentence',
    'jeg savner deg': 'a personal sentence', 'tror du på gud': 'a personal sentence',
    'jeg har et spørsmål': 'a personal sentence', 'jeg er forelsket i deg': 'a personal sentence',
    'jeg er norsk': 'a personal sentence', 'jeg er ikke religiøs': 'a personal sentence',
    # THE SAME EXPRESSION TWICE: the commoner spelling is taught
    'intet problem': 'ikke noe problem is taught', 'godt nytt år': 'godt nyttår is taught',
    'hokuspokus filiokus': 'hokus pokus is taught', 'på vegne': 'på vegne av is taught (and its gloss is misspelt)',
    # NYNORSK, A SPELLING REMOVED IN 2005, OR LATIN
    'i ein fei': 'Nynorsk ("ein")', 'til dømes': 'Nynorsk', 'i hel': 'a spelling removed in 2005',
    'til ansvars': 'a spelling removed in 2005', 'til fullnads': 'a spelling removed in 2005',
    'quod erat demonstrandum': 'Latin', 'summa summarum': 'Latin', 'quantum satis': 'Latin',
    # SEXUAL, A FORM RATHER THAN THE EXPRESSION, OR NOT A PHRASE A LEARNER NEEDS
    'gå til sengs med': 'sexual ("to sleep with")', 'gå til sengs med fienden': 'a film title, and sexual',
    'varte opp': 'a past tense, not the expression', 'joker nord': 'its gloss is not a meaning',
    'bløde kyststribe': 'a geographer\'s term, filed as an idiom',
    'en kvinne uten mann er som en fisk uten sykkel': 'a slogan, not a set phrase',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not (set(g['tags']) & NOT_A_REASON)]


def foreign(k):
    """A loan phrase: it opens with a Latin, Italian or French preposition (`a priori`,
    `ad hoc`, `à jour`), or most of its words are on `FOREIGN` (`anno domini`)."""
    ws = k.split()
    return ws[0] in LOAN_START or sum(w in FOREIGN for w in ws) * 2 >= len(ws)


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
            elif e['pos'] in FIXED_POS:
                sub = 'Fixed expressions'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            if sub != 'Proverbs' and foreign(k):
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
    toks = [[fold(t) for t in tokens(nb)] for _, nb, _ in pairs]
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
