#!/usr/bin/env python3
"""Build a Swahili deck, end to end.

    python3 .claude/swahili/run.py                 # A1
    python3 .claude/swahili/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/swahili/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/swahili/run.py --re-extract    # rebuild lex.json (after changing extract.py)
    python3 .claude/swahili/run.py --level c1      # also fetches CCMatrix (134 MB) and WikiMatrix
                                                   # and counts them into lex-web.json (~15 min)

ONE LEVEL PER RUN (`swahili_level` reads the level once, at import).  Downloads
its sources into `.claude/swahili-cache/` (gitignored, about 200 MB, most of it
Tatoeba's English sentences and the Wiktionary extract) and leaves them there,
so a re-run costs nothing.  Not part of the site.  The plan is
`docs/swahili-decks-plan.md`; read it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Swahili lemma, compacted, with a LEMMA frequency
                    counted in two corpora (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three Tatoeba sentences each, matched on the word's forms
    build_deck.py   headword, glosses, noun class, forms, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Word counts from OpenSubtitles 2024 and Global Voices (CC BY 3.0), via OPUS
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'swahili-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
OPUS = 'https://object.pouta.csc.fi/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-sw.jsonl', 'https://kaikki.org/dictionary/Swahili/'
                        'kaikki.org-dictionary-Swahili.jsonl', False),
    ('os-sw.txt.gz', OPUS + 'OPUS-OpenSubtitles/v2024/mono/sw.txt.gz', False),
    ('gv-sw.txt.gz', OPUS + 'OPUS-GlobalVoices/v2018q4/mono/sw.txt.gz', False),
    ('swh_sentences_detailed.tsv', TATOEBA + 'swh/swh_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('swh-eng_links.tsv', TATOEBA + 'swh/swh-eng_links.tsv.bz2', True),
]
# C1 only: two written corpora, counted on their own into lex-web.json (`extract.py --web`).
WEB_SOURCES = [
    ('ccmatrix-sw.txt.gz', OPUS + 'OPUS-CCMatrix/v1/mono/sw.txt.gz', False),
    ('wikimatrix-sw.txt.gz', OPUS + 'OPUS-WikiMatrix/v1/mono/sw.txt.gz', False),
]


def fetch(sources=SOURCES):
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in sources:
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
    os.environ['SWAHILI_LEVEL'] = level          # read by swahili_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch(SOURCES + (WEB_SOURCES if level == 'c1' else []))
    os.chdir(CACHE)
    stages = [('select.py',), ('examples.py',), ('build_deck.py',)]
    if level == 'c1' and (not os.path.exists('lex-web.json') or '--re-extract' in sys.argv):
        stages.insert(0, ('extract.py', '--web'))
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, ('extract.py',))
    for stage, *args in stages:
        print(stage.split('.')[0] + (' ' + ' '.join(args) if args else '') + ':')
        sys.argv = [stage] + args
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
