#!/usr/bin/env python3
"""Build a Ukrainian deck, end to end.

    python3 .claude/ukrainian/run.py                 # A1
    python3 .claude/ukrainian/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/ukrainian/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/ukrainian/alphabet.py            # the alphabet deck (reads nothing)

ONE LEVEL PER RUN (`ukrainian_level` reads the level once, at import).  Downloads
its sources into `.claude/ukrainian-cache/` (gitignored, about 450 MB, the
Wiktionary extract being 320 MB of it) and leaves them there, so a re-run costs
nothing.  Not part of the site.  The plan is `docs/ukrainian-decks-plan.md`; read
it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Ukrainian lemma, compacted, with a LEMMA frequency
                    (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three Tatoeba sentences each, matched on the word's forms
    build_deck.py   stressed headword, glosses, aspect, forms, tables, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'ukrainian-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
FREQ = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/uk/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-uk.jsonl', 'https://kaikki.org/dictionary/Ukrainian/'
                        'kaikki.org-dictionary-Ukrainian.jsonl', False),
    ('uk_full.txt', FREQ + 'uk_full.txt', False),
    ('ukr_sentences.tsv', TATOEBA + 'ukr/ukr_sentences.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('ukr-eng_links.tsv', TATOEBA + 'ukr/ukr-eng_links.tsv.bz2', True),
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
    os.environ['UKRAINIAN_LEVEL'] = level            # read by ukrainian_level, at import
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
