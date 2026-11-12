#!/usr/bin/env python3
"""Build an Urdu deck, end to end.

    python3 .claude/urdu/run.py                 # A1
    python3 .claude/urdu/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/urdu/run.py --level phr     # the phrases deck, after the levels
    python3 .claude/urdu/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/urdu/alphabet.py            # the alphabet deck (reads lex.json)

ONE LEVEL PER RUN (`urdu_level` reads the level once, at import).  Downloads
its sources into `.claude/urdu-cache/` (gitignored, about 40 MB, nearly all of
it the Wiktionary extract) and leaves them there, so a re-run costs nothing.
Not part of the site.  The plan is `docs/urdu-decks-plan.md`; read it before
changing a stage.

THE wordfreq LIST is read from the `wordfreq` Python package (Apache-2.0 code,
CC BY-SA 4.0 data), installed OUTSIDE the repo and reached through PYTHONPATH,
as Playwright is reached through NODE_PATH:

    pip install --target "$SCRATCH/py" wordfreq
    PYTHONPATH="$SCRATCH/py" python3 .claude/urdu/run.py

It is written once into the cache as `ur_wordfreq.txt` (form, frequency per
billion) and read from there, so later runs need neither the package nor the
network.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Urdu lemma, compacted, with a LEMMA frequency
                    (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three Tatoeba sentences each, matched on the word's forms
    build_deck.py   headword, romanisation, glosses, forms, tables, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
  · The wordfreq project's Urdu list (Wikipedia, web text, Twitter) -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'urdu-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
FREQ = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ur/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-ur.jsonl', 'https://kaikki.org/dictionary/Urdu/'
                        'kaikki.org-dictionary-Urdu.jsonl', False),
    ('ur_full.txt', FREQ + 'ur_full.txt', False),
    ('urd_sentences_detailed.tsv', TATOEBA + 'urd/urd_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('urd-eng_links.tsv', TATOEBA + 'urd/urd-eng_links.tsv.bz2', True),
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
    out = os.path.join(CACHE, 'ur_wordfreq.txt')
    if os.path.exists(out) and os.path.getsize(out) > 0:
        print('  have  ur_wordfreq.txt')
        return
    try:
        import wordfreq
    except ImportError:
        raise SystemExit('ur_wordfreq.txt is not cached and the wordfreq package is not on '
                         'PYTHONPATH -- see the header of this file')
    print('  get   ur_wordfreq.txt  <- wordfreq', wordfreq.__version__ if hasattr(wordfreq, '__version__') else '')
    d = wordfreq.get_frequency_dict('ur', wordlist='small')
    with open(out, 'w', encoding='utf-8') as fh:
        for w, p in sorted(d.items(), key=lambda kv: (-kv[1], kv[0])):
            fh.write(f'{w} {round(p * 1e9)}\n')


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['URDU_LEVEL'] = level            # read by urdu_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['phrases.py' if level == 'phr' else 'select.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
