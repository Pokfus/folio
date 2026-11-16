#!/usr/bin/env python3
"""Build a Khmer deck, end to end.

    python3 .claude/khmer/run.py                 # A1
    python3 .claude/khmer/run.py --level a2      # another level (inventory first: inventory.py)
    python3 .claude/khmer/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/khmer/run.py --re-extract    # re-count Wikipedia and rebuild lex.json
    python3 .claude/khmer/alphabet.py            # the alphabet deck
    python3 .claude/khmer/phrases.py             # the phrases deck (after the levels)

ONE LEVEL PER RUN (`khmer_level` reads the level once, at import).  Downloads its
sources into `.claude/khmer-cache/` (gitignored, about 160 MB, most of it
Tatoeba's English sentences) and leaves them there, so a re-run costs nothing.
Not part of the site, and it needs no library: the word cut Khmer requires is
`km.Segmenter`, written here.  The plan is `docs/khmer-decks-plan.md`; read it
before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    wikitext.py     the Khmer Wikipedia cut into words and counted (km_counts.json)
    extract.py      every Khmer word of Wiktionary, compacted, with its count (lex.json)
                    (both built once for all levels)
    solo.py         how often each word stands alone between typed breaks (solo.json)
    select.py       the inventory, then the commonest remaining words
    romanise.py     each word's romanisation, read off its Wiktionary page (wikt-tr.json)
    examples.py     three sentences each: Tatoeba's, cut into words, then Wiktionary's
    build_deck.py   headword, romanisation, glosses, sentences, and the
                    .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary, via the kaikki.org extraction and the entries' pages -- CC BY-SA 4.0
  · the Khmer Wikipedia, the dump of 2026-11-01 (pinned) -- CC BY-SA 4.0
  · Tatoeba sentence pairs -- CC BY 2.0 FR
  · the Khmer script article of the English Wikipedia, a pinned revision (alphabet.py) -- CC BY-SA 4.0
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'khmer-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-km.jsonl', 'https://kaikki.org/dictionary/Khmer/kaikki.org-dictionary-Khmer.jsonl', False),
    ('kmwiki-20261101.xml.bz2', 'https://dumps.wikimedia.org/kmwiki/20261101/'
                                'kmwiki-20261101-pages-articles.xml.bz2', False),
    ('khm_sentences_detailed.tsv', TATOEBA + 'khm/khm_sentences_detailed.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
    ('khm-eng_links.tsv', TATOEBA + 'khm/khm-eng_links.tsv.bz2', True),
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
    os.environ['KHMER_LEVEL'] = level            # read by khmer_level, at import
    print('building level', level.upper())
    sys.path.insert(0, HERE)
    if '--no-fetch' not in sys.argv:
        print('sources:')
        fetch()
    os.chdir(CACHE)
    stages = ['select.py', 'romanise.py', 'examples.py', 'build_deck.py']
    if not os.path.exists('lex.json') or '--re-extract' in sys.argv:
        stages[:0] = ['wikitext.py', 'extract.py']
    if not os.path.exists('solo.json') or '--re-extract' in sys.argv:
        stages.insert(stages.index('select.py'), 'solo.py')
    for stage in stages:
        print(stage.split('.')[0] + ':')
        sys.argv = [stage]
        runpy.run_path(os.path.join(HERE, stage), run_name='__main__')


if __name__ == '__main__':
    main()
