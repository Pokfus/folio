#!/usr/bin/env python3
"""Build a DELE Spanish deck, end to end.

    python3 .claude/dele/run.py                       # A1
    python3 .claude/dele/run.py --level a2            # A2, on top of A1
    python3 .claude/dele/run.py --level a2 --no-fetch # reuse whatever is cached

ONE LEVEL PER RUN.  `dele_level` reads the level once, at import, so a second
level in the same process would be built against the first one's settings.

A LEVEL IS TAUGHT ON TOP OF THE ONES BELOW IT: A2 excludes every word the
shipped A1 deck contains, read out of `decks/DELE-A1-Spanish.folio-deck.json`
rather than out of a working file, so the two can never drift apart and a
rebuilt A2 cannot start teaching a word A1 already covers.

Downloads its sources into `.claude/dele-cache/` (gitignored) and leaves
them there, so a re-run costs nothing.  The largest is the Wiktionary dump at
about 1 GB; the rest come to some 180 MB.  Not part of the site.

WHERE THE WORDS COME FROM.  There is no published official DELE word list, so
the vocabulary is taken from the body that sets the exam: the A1 column of the
Instituto Cervantes' own Plan curricular.  Its two Nociones inventories are
printed as an A1 column beside an A2 one, so the A1 half can be read off on its
own.  Those inventories list NOTIONS rather than words, though, so a whole
closed class can appear as one bracketed label -- `[números cardinales]`,
`[día de la semana]` -- and the grammar layer (pronouns, articles,
prepositions, conjunctions) is inventoried separately under Gramática and
appears in neither page.  Those are supplied by `supplement.py`; the rest of the
500 is filled from the A1 column in order of frequency.

THE STAGES, in order.  Each writes its output into the cache for the next:

    parse_pcic.py     the A1 cells   -> candidate lemmas
    supplement.py     the closed classes the inventory names but never writes out
    extract_kaikki.py Wiktionary records for every candidate
    select.py         the 500, weighted to the Cervantes column
    examples.py       three Tatoeba sentences each
    build_deck.py     articles, glosses, conjugation tables, cards
    emit.py           the .folio-deck.json

SOURCES AND LICENCES, which the deck's own description also states:
  · Plan curricular del Instituto Cervantes -- cvc.cervantes.es
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
"""
import os, sys, runpy, urllib.request, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '..', 'dele-cache')
CACHE = os.path.abspath(CACHE)

PCIC = 'https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/'
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
# The Nociones inventories are printed two levels to a page, A1 beside A2 and B1
# beside B2, so a level needs one pair and both pairs are kept in the cache.
SOURCES = [
    ('pcic_a1a2.htm',      PCIC + '09_nociones_especificas_inventario_a1-a2.htm', False),
    ('pcic_gen_a1a2.htm',  PCIC + '08_nociones_generales_inventario_a1-a2.htm',   False),
    ('pcic_b1b2.htm',      PCIC + '09_nociones_especificas_inventario_b1-b2.htm', False),
    ('pcic_gen_b1b2.htm',  PCIC + '08_nociones_generales_inventario_b1-b2.htm',   False),
    ('es_50k.txt',         'https://raw.githubusercontent.com/hermitdave/FrequencyWords/'
                           'master/content/2018/es/es_50k.txt',                   False),
    ('kaikki-es.jsonl',    'https://kaikki.org/dictionary/Spanish/'
                           'kaikki.org-dictionary-Spanish.jsonl',                 False),
    ('spa_sent.tsv',       TATOEBA + 'spa/spa_sentences_detailed.tsv.bz2',        True),
    ('eng_sent.tsv',       TATOEBA + 'eng/eng_sentences.tsv.bz2',                 True),
    ('spa_eng_links.tsv',  TATOEBA + 'spa/spa-eng_links.tsv.bz2',                 True),
]

STAGES = ['examples.py', 'build_deck.py', 'emit.py']


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES:
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


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['DELE_LEVEL'] = level          # read by dele_level, at import
    print('building level', level.upper())
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.makedirs(CACHE, exist_ok=True)
    os.chdir(CACHE)
    sys.path.insert(0, HERE)          # so a stage can `import supplement`
    from dele_level import f as lvlf
    import json

    # the candidate list the Wiktionary extraction is run over is the union of
    # the inventory's own words and the closed classes; both stages write it
    runpy.run_path(os.path.join(HERE, 'parse_pcic.py'), run_name='__main__')
    runpy.run_path(os.path.join(HERE, 'supplement.py'), run_name='__main__')
    cands = json.load(open(lvlf('pcic_candidates.json')))
    supp = json.load(open(lvlf('supplement.json')))
    json.dump(sorted(set(list(cands) + supp)), open(lvlf('lookup.json'), 'w'), ensure_ascii=False)
    sys.argv = ['extract_kaikki.py', lvlf('lookup.json'), lvlf('wikt.json')]
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    print('--- select.py')
    runpy.run_path(os.path.join(HERE, 'select.py'), run_name='__main__')

    # A reflexive's paradigm is its base verb's, so the bases are fetched once
    # the words are chosen -- derived from the selection rather than named here,
    # or a level whose inventory lists different reflexives would silently get
    # no conjugation for them.
    chosen = json.load(open(lvlf('wordlist.json')))
    bases = sorted({k[:-2] for k in chosen if k.endswith(('arse', 'erse', 'irse'))})
    print(f'    reflexives: {len(bases)} base verbs to fetch')
    json.dump(bases, open(lvlf('bases.json'), 'w'), ensure_ascii=False)
    sys.argv = ['extract_kaikki.py', lvlf('bases.json'), lvlf('wikt_bases.json')]
    runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')

    print('--- examples.py')
    runpy.run_path(os.path.join(HERE, 'examples.py'), run_name='__main__')

    # A word the sentence corpus does not cover would ship with no examples at
    # all, which the deck's own description promises it has.  Swap it for the
    # next word in the ranked order and look again.  A1 needs no pass of this;
    # it fires on the rarer words a smaller pool pulls in.
    for attempt in range(4):
        ex = json.load(open(lvlf('examples.json')))
        chosen = json.load(open(lvlf('wordlist.json')))
        empty = [k for k in chosen if not ex.get(k)]
        if not empty:
            break
        ranked = json.load(open(lvlf('ranked.json')))
        spare = [k for k in ranked if k not in set(chosen)]
        if not spare:
            print(f'    {len(empty)} word(s) with no example and no replacement left: '
                  f'{", ".join(empty)}')
            break
        print(f'    no sentences for {", ".join(empty)} -- swapping in '
              f'{", ".join(spare[:len(empty)])}')
        keep = [k for k in chosen if k not in set(empty)] + spare[:len(empty)]
        json.dump(keep, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=0)
        bases = sorted({k[:-2] for k in keep if k.endswith(('arse', 'erse', 'irse'))})
        json.dump(bases, open(lvlf('bases.json'), 'w'), ensure_ascii=False)
        sys.argv = ['extract_kaikki.py', lvlf('bases.json'), lvlf('wikt_bases.json')]
        runpy.run_path(os.path.join(HERE, 'extract_kaikki.py'), run_name='__main__')
        runpy.run_path(os.path.join(HERE, 'examples.py'), run_name='__main__')

    for s in STAGES[1:]:
        print(f'--- {s}')
        runpy.run_path(os.path.join(HERE, s), run_name='__main__')


if __name__ == '__main__':
    main()
