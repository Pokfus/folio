#!/usr/bin/env python3
"""Build the CAPLE Portuguese deck, end to end.

    python3 .claude/caple/run.py                    # A1
    python3 .claude/caple/run.py --no-fetch         # reuse whatever is cached
    python3 .claude/caple/run.py --variety-check    # re-prove the corpus choice

ONE LEVEL PER RUN.  `caple_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings.  A1,
A2 and B1 have decks; B2 and above would each take a row in that module's tables
plus a `BELOW` entry, which is how the four DELE levels and the three Goethe
ones avoid teaching the same word twice.

A LEVEL IS BUILT ON THE SHIPPED DECKS BELOW IT, so build them IN ORDER and
rebuild the lot after any change to a shared stage -- `words_below` reads A1's
and A2's deck FILES to know what B1 may not re-teach, so a stale file lower down
is a higher level quietly teaching the same word twice.  It is also why every
level must reproduce byte for byte after a change that was meant for one of
them: that is the only thing standing between a shared stage and a silent
regression in a deck nobody was looking at.

Downloads its sources into `.claude/caple-cache/` (gitignored) and leaves them
there, so a re-run costs nothing.  The largest is the Wiktionary dump at about
560 MB; the rest come to some 180 MB.  Not part of the site.

WHERE THE WORDS COME FROM.  CAPLE publishes no vocabulary list -- its site
carries exam specifications and nothing else, checked page by page -- so the
words come from the reference description CAPLE's own Recursos page links to:
the Referencial Camões PLE.  That is the same relationship the DELE pipeline has
with the Instituto Cervantes' Plan curricular, with the difference that here the
exam board points at the source rather than being the source.  Only the
inventory of WORDS is taken; the Referencial's own prose is not reproduced, in
the same way the Goethe pipeline takes the Wortliste and leaves the
Goethe-Institut's example sentences alone.

THE DECK IS EUROPEAN PORTUGUESE, which is a decision that reaches into every
stage rather than a line in the description -- see the header of `caple_level.py`
for the four places it bites and the measurements behind each.

THE STAGES, in order.  Each writes its output into the cache for the next:

    parse_referencial.py  the A1 Noções / Funções / Gramática -> candidates
    supplement.py         the closed classes the inventory never writes out
    extract_kaikki.py     Wiktionary records for every candidate
    select.py             the 500, weighted to the Noções inventory
    examples.py           three Tatoeba sentences each, Brazilian ones rejected
    build_deck.py         articles, genders, conjugations, cards
    emit.py               the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · Referencial Camões PLE -- instituto-camoes.pt (the word inventory only)
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
"""
import os
import runpy
import shutil
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'caple-cache'))

TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('referencial.html',
     'https://www.instituto-camoes.pt/activity/centro-virtual/referencial-camoes-ple',
     False),
    ('kaikki-pt.jsonl',
     'https://kaikki.org/dictionary/Portuguese/kaikki.org-dictionary-Portuguese.jsonl',
     False),
    # THE EUROPEAN LIST, not `pt_br`.  See `caple_level.PT_IS_EUROPEAN` for the
    # measurement; `--variety-check` re-runs it.
    ('pt_50k.txt',
     'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/'
     'content/2018/pt/pt_50k.txt', False),
    # THE BRAZILIAN LIST ORDERS NOTHING and is fetched all the same: `select.py`
    # reads it to REPORT a candidate that is markedly commoner there than here,
    # which is how `xícara` was found in B1.  See the note above `BRAZILIAN`.
    ('ptbr_50k.txt',
     'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/'
     'content/2018/pt_br/pt_br_50k.txt', False),
    ('por_sentences_detailed.tsv', TATOEBA + 'por/por_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv',          TATOEBA + 'eng/eng_sentences.tsv.bz2',          True),
    ('por-eng_links.tsv',          TATOEBA + 'por/por-eng_links.tsv.bz2',          True),
]



def fetch(extra=()):
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in list(SOURCES) + list(extra):
        out = os.path.join(CACHE, name)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print(f'  have  {name}')
            continue
        print(f'  get   {name}  <- {url}')
        tmp = out + ('.bz2' if bz else '.part')
        with urllib.request.urlopen(url) as r, open(tmp, 'wb') as f:
            shutil.copyfileobj(r, f)
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)


def variety_check():
    """Re-prove that `pt_50k.txt` is European and `pt_br_50k.txt` is not.

    Nothing in either file says which variety it is, and the whole deck rests on
    getting it the right way round -- so the claim is a measurement that can be
    re-run rather than a comment that can rot.
    """
    fetch()
    os.chdir(CACHE)

    def load(p):
        d = {}
        for i, line in enumerate(open(p, encoding='utf-8')):
            t = line.split()
            if len(t) == 2:
                d.setdefault(t[0], (i + 1, int(t[1])))
        return d

    pt, br = load('pt_50k.txt'), load('ptbr_50k.txt')
    PAIRS = [('comboio', 'trem'), ('autocarro', 'ónibus'),
             ('telemóvel', 'celular'), ('pequeno-almoço', 'café da manhã'),
             ('frigorífico', 'geladeira'), ('sandes', 'sanduíche'),
             ('rapariga', 'garota')]
    print(f"{'word':<18}{'pt rank':>9}{'pt hits':>10}{'br rank':>9}{'br hits':>10}")
    wrong = 0
    for eu, bz in PAIRS:
        for w, want_eu in ((eu, True), (bz, False)):
            r1, c1 = pt.get(w, (0, 0))
            r2, c2 = br.get(w, (0, 0))
            ok = (c1 > c2) if want_eu else (c2 > c1)
            wrong += not ok
            print(f'{w:<18}{r1:>9}{c1:>10}{r2:>9}{c2:>10}   '
                  f'{"ok" if ok else "UNEXPECTED"}')
    if wrong:
        raise SystemExit(f'{wrong} of the shibboleths came out the wrong way '
                         f'round -- the two lists may have been rebuilt or '
                         f'swapped.  Do not build against them until this is '
                         f'understood.')
    print('\n  pt_50k.txt is European Portuguese, confirmed on '
          f'{2 * len(PAIRS)} test words.')


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['CAPLE_LEVEL'] = level          # read by caple_level, at import
    sys.path.insert(0, HERE)

    if '--variety-check' in sys.argv:
        variety_check()
        return

    print('building level', level.upper())
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)

    from caple_level import f as lvlf
    import json

    print('word list:')
    runpy.run_path(os.path.join(HERE, 'parse_referencial.py'), run_name='__main__')
    runpy.run_path(os.path.join(HERE, 'supplement.py'), run_name='__main__')

    # every lemma any entry might be looked up under, plus the base verb of
    # every reflexive -- a reflexive has no Wiktionary record of its own, so the
    # paradigm has to come from the base and the base has to be fetched.
    #
    # ONLY THE REFLEXIVES THIS LEVEL NAMES, and that `if` is load-bearing.
    # `reflexives.py` covers every level at once, and the pool `select.py`
    # builds is everything with a Wiktionary record -- so fetching all of their
    # bases puts the bases into THIS level's word list whether or not its
    # inventory ever names them.  Written without the guard, adding A2's twenty
    # reflexives put `voltar`, `casar`, `tornar`, `divertir` and fifteen more
    # into the A1 deck, pushing nineteen real A1 nouns out of the top 500 --
    # with A1 still building cleanly at exactly 500 words.
    from reflexives import GLOSS as REFL, base as refl_base
    cands = set(json.load(open(lvlf('referencial_candidates.json'))))
    cands |= set(json.load(open(lvlf('supplement.json'))))
    cands |= {refl_base(k) for k in REFL if k in cands}
    json.dump(sorted(cands), open(lvlf('lookup.json'), 'w'), ensure_ascii=False)

    print('wiktionary:')
    sys.argv = ['extract_kaikki.py', lvlf('lookup.json'), lvlf('wikt.json'),
                'kaikki-pt.jsonl']
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    for stage in ('select.py', 'examples.py', 'build_deck.py', 'emit.py'):
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
