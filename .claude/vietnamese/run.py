#!/usr/bin/env python3
"""Build a Vietnamese deck, end to end.

    python3 .claude/vietnamese/run.py                 # A1
    python3 .claude/vietnamese/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/vietnamese/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/vietnamese/tones.py               # the alphabet-and-tones deck

ONE LEVEL PER RUN (`vietnamese_level` reads the level once, at import).  Downloads
its sources into `.claude/vietnamese-cache/` (gitignored, about 270 MB: the
Wiktionary extract 83 MB, the subtitles 64 MB, Tatoeba's English 109 MB) and leaves them there, so a re-run costs
nothing.  Not part of the site.  The plan is `docs/vietnamese-decks-plan.md`; read
it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Vietnamese word, compacted, with a WORD frequency
                    counted by segmenting the subtitles (built once: lex.json,
                    the segmentation cached in seg-counts.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three Tatoeba sentences each, matched as a whole word
    build_deck.py   headword, tones, glosses, classifier, characters, IPA, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · The OpenSubtitles 2018 Vietnamese text (opensubtitles.org, via OPUS), counted here
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'vietnamese-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
OPUS = 'https://object.pouta.csc.fi/OPUS-OpenSubtitles/v2018/mono/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-vi.jsonl', 'https://kaikki.org/dictionary/Vietnamese/'
                        'kaikki.org-dictionary-Vietnamese.jsonl', False),
    ('vi.txt.gz', OPUS + 'vi.txt.gz', False),
    ('vie_sentences_detailed.tsv', TATOEBA + 'vie/vie_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('vie-eng_links.tsv', TATOEBA + 'vie/vie-eng_links.tsv.bz2', True),
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
    os.environ['VIET_LEVEL'] = level             # read by vietnamese_level, at import
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
