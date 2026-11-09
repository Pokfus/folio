#!/usr/bin/env python3
"""Build a Thai deck, end to end.

    python3 .claude/thai/run.py                 # A1
    python3 .claude/thai/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/thai/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/thai/alphabet.py            # the alphabet deck (reads lex.json)

ONE LEVEL PER RUN (`thai_level` reads the level once, at import).  Downloads
its sources into `.claude/thai-cache/` (gitignored, about 165 MB, most of it
Tatoeba's English sentences) and leaves them there, so a re-run costs nothing.
Not part of the site, and it needs no library: the word cut Thai requires is
`th.Segmenter`, written here.  The plan is `docs/thai-decks-plan.md`; read it
before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Thai word, compacted, with its corpus frequency
                    (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three sentences each: Tatoeba's, cut into words, then Wiktionary's
    build_deck.py   headword, romanisation, glosses, classifiers, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Thai National Corpus and Thai Textbook Corpus word frequencies, as
    distributed by PyThaiNLP -- CC0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'thai-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
# PINNED to a commit so the counts cannot move under a re-run.
PYTHAINLP = 'https://raw.githubusercontent.com/PyThaiNLP/pythainlp/{rev}/pythainlp/corpus/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-th.jsonl', 'https://kaikki.org/dictionary/Thai/kaikki.org-dictionary-Thai.jsonl', False),
    ('tnc_freq.txt', None, False),
    ('ttc_freq.txt', None, False),
    ('tha_sentences_detailed.tsv', TATOEBA + 'tha/tha_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('tha-eng_links.tsv', TATOEBA + 'tha/tha-eng_links.tsv.bz2', True),
]
PYTHAINLP_REV = 'dac9ca804bbeb0e5396224020bfae208ba795414'   # dev, read 2026-11-09


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    for name, url, bz in SOURCES:
        if url is None:
            url = PYTHAINLP.format(rev=PYTHAINLP_REV) + name
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
    os.environ['THAI_LEVEL'] = level            # read by thai_level, at import
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
