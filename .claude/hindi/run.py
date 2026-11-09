#!/usr/bin/env python3
"""Build a Hindi deck, end to end.

    python3 .claude/hindi/run.py                 # A1
    python3 .claude/hindi/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/hindi/run.py --level c1      # C1 ranks by wordfreq's list (the wheel)
    python3 .claude/hindi/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/hindi/alphabet.py            # the alphabet deck (reads lex.json)

ONE LEVEL PER RUN (`hindi_level` reads the level once, at import).  Downloads
its sources into `.claude/hindi-cache/` (gitignored, about 280 MB, the
Wiktionary extract being 170 MB of it) and leaves them there, so a re-run costs
nothing.  Not part of the site.  The plan is `docs/hindi-decks-plan.md`; read
it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    extract.py      every Hindi lemma, compacted, with a LEMMA frequency
                    (built once for all levels: lex.json)
    select.py       the inventory, then the commonest remaining words
    examples.py     three Tatoeba sentences each, matched on the word's forms
    build_deck.py   headword, romanisation, glosses, forms, tables, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · A frequency list built from OpenSubtitles (hermitdave/FrequencyWords) -- CC BY-SA 4.0
  · C1's frequency: wordfreq 3.1.1's Hindi list (Wikipedia, ParaCrawl, Twitter, Reddit)
    -- data CC BY-SA 4.0; read from the pinned wheel by `wordfreq_hi.py`, never installed
  · Tatoeba sentence pairs -- CC BY 2.0 FR
"""
import hashlib, os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'hindi-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
FREQ = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/hi/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-hi.jsonl', 'https://kaikki.org/dictionary/Hindi/'
                        'kaikki.org-dictionary-Hindi.jsonl', False),
    ('hi_full.txt', FREQ + 'hi_full.txt', False),
    ('hin_sentences_detailed.tsv', TATOEBA + 'hin/hin_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('hin-eng_links.tsv', TATOEBA + 'hin/hin-eng_links.tsv.bz2', True),
    ('wordfreq-3.1.1-py3-none-any.whl', 'https://files.pythonhosted.org/packages/24/61/'
     '62835c475d69872d30689f284497853fe33fe1d6dd18f57346d13305861d/wordfreq-3.1.1-py3-none-any.whl',
     False),
]
# A PINNED FILE is checked against its hash: the wheel's data ranks C1, and a different
# wordfreq release would silently re-rank it.
SHA256 = {'wordfreq-3.1.1-py3-none-any.whl':
          '4b1c6ecffc6198be3396d5cf871c4423ca71c907c231348d352dd54d62b97473'}


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
    for name, want in SHA256.items():
        got = hashlib.sha256(open(os.path.join(CACHE, name), 'rb').read()).hexdigest()
        if got != want:
            raise SystemExit(f'{name}: sha256 {got}, expected {want}')


def main():
    level = 'a1'
    if '--level' in sys.argv:
        level = sys.argv[sys.argv.index('--level') + 1].lower()
    os.environ['HINDI_LEVEL'] = level            # read by hindi_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['select.py', 'examples.py', 'build_deck.py']
    # C1 ranks by `wf`, which a lex.json built before the wheel was fetched lacks
    stale = level == 'c1' and os.path.exists('lex.json') and '"wf":' not in open('lex.json').read(4000)
    if not os.path.exists('lex.json') or stale or '--re-extract' in sys.argv:
        stages.insert(0, 'extract.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
