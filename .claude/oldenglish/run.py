#!/usr/bin/env python3
"""Build an Old English deck, end to end.

    python3 .claude/oldenglish/run.py                 # Level 1
    python3 .claude/oldenglish/run.py --level l2      # another level (built on the ones below)
    python3 .claude/oldenglish/run.py --no-fetch      # reuse whatever is cached
    python3 .claude/oldenglish/alphabet.py            # the alphabet deck
    node .claude/oldenglish/check-oldenglish.js       # the check

ONE LEVEL PER RUN (`oe_level` reads the level once, at import).  Downloads its
sources into `.claude/oldenglish-cache/` (gitignored, about 250 MB, the
Wiktionary extract and Tatoeba's English sentences being nearly all of it) and
leaves them there, so a re-run costs nothing.  Not part of the site.  The plan
is `docs/oldenglish-decks-plan.md`; read it before changing a stage.

THE STAGES, in order.  Each writes its output into the cache for the next:

    corpus.py       the Old English prose the frequencies are counted over
    extract.py      every lemma, compacted, with a LEMMA frequency (lex.json)
    select.py       the level's band of the frequency order
    examples.py     up to three Tatoeba sentences each, matched on the word's forms
    build_deck.py   headword, IPA, glosses, forms, descendant, paradigm, sentences,
                    and the .folio-deck.json in decks/

SOURCES AND LICENCES, which the deck's own description also states:
  · English Wiktionary via the kaikki.org extraction -- CC BY-SA 4.0
  · Thorpe's Ælfric (1844) and Sweet's Primer (1905), Project Gutenberg -- public domain
  · Tatoeba sentences and translations -- CC BY 2.0 FR
"""
import os, runpy, shutil, subprocess, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.abspath(os.path.join(HERE, '..', 'oldenglish-cache'))
TATOEBA = 'https://downloads.tatoeba.org/exports/per_language/'
PG = 'https://www.gutenberg.org/cache/epub/'

# (local name, url, bunzip2?)
SOURCES = [
    ('kaikki-ang.jsonl', 'https://kaikki.org/dictionary/Old%20English/'
                         'kaikki.org-dictionary-OldEnglish.jsonl', False),
    ('pg38334.html', PG + '38334/pg38334-images.html', False),     # Thorpe's Ælfric, vol. 1
    ('pg34316.html', PG + '34316/pg34316-images.html', False),     # Sweet's Primer, 8th ed.
    ('ang_sentences.tsv', TATOEBA + 'ang/ang_sentences.tsv.bz2', True),
    ('ang-eng_links.tsv', TATOEBA + 'ang/ang-eng_links.tsv.bz2', True),
    ('eng_sentences.tsv', TATOEBA + 'eng/eng_sentences.tsv.bz2', True),
]
STAGES = ['corpus.py', 'extract.py', 'select.py', 'examples.py', 'build_deck.py']


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
    args = sys.argv[1:]
    if '--level' in args:
        os.environ['OE_LEVEL'] = args[args.index('--level') + 1].lower()
    if '--no-fetch' not in args:
        fetch()
    os.chdir(CACHE)
    sys.path.insert(0, HERE)
    for st in STAGES:
        print(f'— {st}')
        runpy.run_path(os.path.join(HERE, st), run_name='__main__')


if __name__ == '__main__':
    main()
