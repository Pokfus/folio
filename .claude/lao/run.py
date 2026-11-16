#!/usr/bin/env python3
"""Build a Lao deck, end to end.

    python3 .claude/lao/run.py                 # A1
    python3 .claude/lao/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/lao/run.py --re-extract    # rebuild lex.json and freq.json
    python3 .claude/lao/alphabet.py            # the alphabet deck (reads lex.json)
    python3 .claude/lao/phrases.py             # the phrases deck (after the levels)

ONE LEVEL PER RUN (`lao_level` reads the level once, at import).  Downloads
its sources into `.claude/lao-cache/` (gitignored, about 140 MB, most of it
Tatoeba's English sentences) and leaves them there, so a re-run costs nothing.
Not part of the site, and it needs no library: the word cut Lao requires is
`lo.Segmenter`, Thai's re-keyed.  The plan is `docs/lao-decks-plan.md`; read it
before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Lao word in Wiktionary, its romanisation read off
                    the IPA, and its count in Lao Wikipedia (lex.json, once)
    select.py       the inventory, then the commonest remaining words
    examples.py     three sentences each: Tatoeba's, then Wiktionary's
    build_deck.py   headword, romanisation, glosses, classifiers, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · the Lao Wikipedia dump, counted for word frequency -- CC BY-SA 4.0
    (no text ships).  PINNED to a dated dump so the counts cannot move.
  · Tatoeba sentence pairs -- CC BY 2.0 FR
The kaikki and Tatoeba files are not versioned by their hosts; a re-run on a
later download may differ, as every other pipeline's does.
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'lao-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
WIKI_DUMP = '20261101'   # the lowiki dump read on 2026-11-15

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-lo.jsonl', 'https://kaikki.org/dictionary/Lao/kaikki.org-dictionary-Lao.jsonl', False),
    ('lowiki-pages-articles.xml.bz2',
     f'https://dumps.wikimedia.org/lowiki/{WIKI_DUMP}/lowiki-{WIKI_DUMP}-pages-articles.xml.bz2', False),
    ('lao_sentences_detailed.tsv', TATOEBA + 'lao/lao_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('lao-eng_links.tsv', TATOEBA + 'lao/lao-eng_links.tsv.bz2', True),
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
        with urllib.request.urlopen(url) as r, open(tmp, 'wb') as fh:
            shutil.copyfileobj(r, fh)
        if bz:
            subprocess.run(['bunzip2', '-f', tmp], check=True)
        else:
            os.replace(tmp, out)


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['LAO_LEVEL'] = level            # read by lao_level, at import
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
