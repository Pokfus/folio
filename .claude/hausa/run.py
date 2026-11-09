#!/usr/bin/env python3
"""Build a Hausa deck, end to end.

    python3 .claude/hausa/run.py                 # A1
    python3 .claude/hausa/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/hausa/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/hausa/run.py --re-extract    # rebuild lex.json (after editing hand.py!)
    python3 .claude/hausa/alphabet.py            # the alphabet deck (reads lex.json)

ONE LEVEL PER RUN (`hausa_level` reads the level once, at import).  Downloads
its sources into `.claude/hausa-cache/` (gitignored, about 200 MB, the English
half of Tatoeba being most of it) and leaves them there, so a re-run costs
nothing.  Not part of the site.  The plan is `docs/hausa-decks-plan.md`; read it
before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Hausa word in Wiktionary plus the hand glosses, with a
                    LEMMA frequency counted from Tatoeba (built once: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three Tatoeba sentences each, matched on the word's forms
    build_deck.py   headword, toned form, glosses, forms, sentences, and the
                    .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Tatoeba sentences and their English translations -- CC BY 2.0 FR
  · Folio's own glosses for the core words Wiktionary lacks (`hand.py`)
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'hausa-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-ha.jsonl', 'https://kaikki.org/dictionary/Hausa/'
                        'kaikki.org-dictionary-Hausa.jsonl', False),
    ('hau_sentences_detailed.tsv', TATOEBA + 'hau/hau_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('hau-eng_links.tsv', TATOEBA + 'hau/hau-eng_links.tsv.bz2', True),
]


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
    os.environ['HAUSA_LEVEL'] = level            # read by hausa_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['select.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
